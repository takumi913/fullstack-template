package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"fullstack-template/api"
	"fullstack-template/configs"
	"fullstack-template/db/migrations"
	"fullstack-template/pkg/database"
	"fullstack-template/pkg/handler"
	middleware2 "fullstack-template/pkg/middleware"
	"fullstack-template/pkg/repo"
	"fullstack-template/pkg/service"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	// echo 内部使用 log/slog，应用日志保持一致，避免同一份 stdout 里混两种格式。
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
	adminID, err := adminCommandUserID(os.Args[1:])
	if errors.Is(err, flag.ErrHelp) {
		return
	}
	if err != nil {
		fatal("命令参数错误", err)
	}
	if err := configs.Init(); err != nil {
		fatal("配置初始化失败", err)
	}
	if err := database.Init(); err != nil {
		fatal("数据库初始化失败", err)
	}
	if err := migrations.Up(context.Background(), database.GetDB(), configs.AppConfig.Database.Driver); err != nil {
		_ = database.Close()
		fatal("数据库迁移失败", err)
	}

	store := repo.NewStore(database.GetDB(), configs.AppConfig.Database.Driver)
	adminService := service.NewAdminService(store)
	if adminID != "" {
		if err := adminService.Grant(context.Background(), adminID); err != nil {
			_ = database.Close()
			fatal("授予平台管理员权限失败", err)
		}
		if err := database.Close(); err != nil {
			fatal("关闭数据库失败", err)
		}
		return
	}
	authService := service.NewAuthService(store)
	userService := service.NewUserService(store)
	handlers := api.Handlers{Auth: handler.NewAuthHandler(authService), User: handler.NewUserHandler(userService), Admin: handler.NewAdminHandler(adminService)}
	authMiddleware := middleware2.NewAuthMiddleware(authService)

	e := echo.New()
	// 限流按客户端 IP 计数。默认只信任连接来源；部署在反向代理后面时必须开启
	// TRUST_PROXY，否则所有用户会被算作同一个 IP，一个人触发限流会波及全部用户。
	if configs.AppConfig.Server.TrustProxy {
		e.IPExtractor = echo.ExtractIPFromXFFHeader()
	} else {
		e.IPExtractor = echo.ExtractIPDirect()
	}
	// RequestID 让访问日志和处理器里的错误日志能通过同一个 id 关联起来。
	e.Use(middleware.RequestID())
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{LogStatus: true, LogURI: true, LogMethod: true, LogLatency: true, LogRequestID: true, HandleError: true, LogValuesFunc: func(_ *echo.Context, v middleware.RequestLoggerValues) error {
		slog.Info("request", "method", v.Method, "uri", v.URI, "status", v.Status, "latency_ms", v.Latency.Milliseconds(), "request_id", v.RequestID)
		return nil
	}}))
	e.Use(middleware.Recover())
	// 限制请求体大小：注册等接口在鉴权之前就会读取并解析请求体，
	// 没有上限时一个超大请求即可耗尽内存（超时只限制时长，不限制体积）。
	e.Use(middleware.BodyLimit(64 * 1024))
	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{AllowOrigins: configs.AppConfig.Server.CORSOrigins, AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions}, AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept}, AllowCredentials: true}))
	api.SetupRoutes(e, handlers, authMiddleware)
	setupStaticFiles(e)

	// SIGINT/SIGTERM 触发优雅关机（默认 10 秒宽限），之后统一关闭数据库连接。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	go purgeExpiredSessions(ctx, store)
	sc := echo.StartConfig{Address: configs.AppConfig.GetServerAddress(), BeforeServeFunc: func(s *http.Server) error {
		s.ReadHeaderTimeout = 10 * time.Second
		s.ReadTimeout = 30 * time.Second
		s.WriteTimeout = 30 * time.Second
		s.IdleTimeout = 2 * time.Minute
		return nil
	}}
	// Start 会在收到信号后完成优雅关机再返回，正常关机返回 nil。
	err = sc.Start(ctx, e)
	stop()
	if closeErr := database.Close(); closeErr != nil {
		slog.Error("关闭数据库失败", "error", closeErr)
	}
	if err != nil {
		fatal("服务器异常退出", err)
	}
}

// adminCommandUserID keeps administrator grants explicit and separate from public registration.
func adminCommandUserID(args []string) (string, error) {
	if len(args) == 0 {
		return "", nil
	}
	if args[0] != "grant-admin" {
		return "", fmt.Errorf("用法: ./server [grant-admin --user-id <已注册用户ID>]")
	}
	flags := flag.NewFlagSet("grant-admin", flag.ContinueOnError)
	userID := flags.String("user-id", "", "授予平台管理员权限的已注册用户 ID")
	if err := flags.Parse(args[1:]); err != nil {
		return "", err
	}
	if strings.TrimSpace(*userID) == "" || flags.NArg() != 0 {
		return "", fmt.Errorf("用法: ./server grant-admin --user-id <已注册用户ID>")
	}
	return strings.TrimSpace(*userID), nil
}

// fatal 记录错误后退出。不用 log.Fatal 是为了统一走 slog，
// 也避免 os.Exit 跳过已注册的 defer。
func fatal(msg string, err error) {
	slog.Error(msg, "error", err)
	os.Exit(1)
}

// purgeExpiredSessions 定期清理过期会话，否则 sessions 表会无限增长。
func purgeExpiredSessions(ctx context.Context, store *repo.Store) {
	const interval = time.Hour
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		if err := store.DeleteExpiredSessions(ctx); err != nil && ctx.Err() == nil {
			slog.Error("清理过期会话失败", "error", err)
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

// staticFilePath 将 URL 路径映射到静态目录内的文件路径。
// 先以根路径清洗，保证 ".." 无法逃出 staticDir（防止路径穿越读取任意文件）。
func staticFilePath(staticDir, urlPath string) string {
	return filepath.Join(staticDir, filepath.Clean("/"+urlPath))
}

// regularFile 判断路径是否为可直接返回的普通文件。
// 目录必须排除：c.File 对目录会回落到其中的 index.html，
// 于是 /assets/.. 这类请求会拿到带一年强缓存的首页。
func regularFile(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.Mode().IsRegular()
}

// apiPath 判断请求是否属于 API 命名空间。
func apiPath(path string) bool {
	return path == "/api" || strings.HasPrefix(path, "/api/")
}

//go:embed web/src/i18n/locales.json
var localeDefinitions []byte

// localizedPathPrefixes uses the same language registry as the frontend router.
func localizedPathPrefixes() []string {
	var locales map[string]struct {
		Prefix string `json:"prefix"`
	}
	if err := json.Unmarshal(localeDefinitions, &locales); err != nil {
		panic("invalid embedded locale registry: " + err.Error())
	}
	prefixes := make([]string, 0, len(locales))
	for _, locale := range locales {
		if locale.Prefix != "" {
			prefixes = append(prefixes, locale.Prefix+"/")
		}
	}
	return prefixes
}

var publicLocalePrefixes = localizedPathPrefixes()

// spaFallbackPath 判断路径是否属于只在浏览器中运行的应用页面。
// 公开 SEO 页面必须由真实静态 HTML 命中；这里只允许登录和后台路由使用 SPA fallback。
func spaFallbackPath(path string) bool {
	for _, prefix := range publicLocalePrefixes {
		if strings.HasPrefix(path, prefix) {
			path = "/" + strings.TrimPrefix(path, prefix)
			break
		}
	}
	switch path {
	case "/login", "/register", "/dashboard", "/admin/users":
		return true
	}
	return strings.HasPrefix(path, "/settings/")
}

// trailingSlashRedirectTarget 将非根路径统一为无尾斜杠 URL。
// canonical URL 也采用无尾斜杠，避免同一静态页存在两套可抓取地址。
func trailingSlashRedirectTarget(path, rawQuery string) (string, bool) {
	if path == "/" || !strings.HasSuffix(path, "/") {
		return "", false
	}

	target := strings.TrimSuffix(path, "/")
	if rawQuery != "" {
		target += "?" + rawQuery
	}
	return target, true
}

// staticPagePath 解析静态文件和预渲染目录。
// Solid SSG 会把 /legal/terms 输出为 static/legal/terms/index.html。
func staticPagePath(staticDir, urlPath string) (string, bool) {
	filePath := staticFilePath(staticDir, urlPath)
	if regularFile(filePath) {
		return filePath, true
	}
	if info, err := os.Stat(filePath); err == nil && info.IsDir() {
		indexPath := filepath.Join(filePath, "index.html")
		if regularFile(indexPath) {
			return indexPath, true
		}
	}
	return "", false
}

// setupStaticFiles 设置生产静态文件服务.
func setupStaticFiles(e *echo.Echo) {
	setupStaticFilesFromDir(e, "static")
}

// setupStaticFilesFromDir 将静态目录参数化，便于对 SSG、SPA fallback 与 404 行为做 HTTP 测试。
func setupStaticFilesFromDir(e *echo.Echo, staticDir string) {
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		slog.Warn("静态文件目录不存在，跳过静态文件服务", "dir", staticDir)
		return
	}

	e.GET("/assets/*", func(c *echo.Context) error {
		filePath := staticFilePath(staticDir, c.Request().URL.Path)
		if !regularFile(filePath) {
			return echo.NewHTTPError(http.StatusNotFound, "File not found")
		}
		c.Response().Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		return c.File(filePath)
	})

	e.GET("/*", func(c *echo.Context) error {
		path := c.Request().URL.Path

		if apiPath(path) {
			return echo.NewHTTPError(http.StatusNotFound, "API endpoint not found")
		}

		if path == "/" {
			c.Response().Header().Set("Cache-Control", "no-cache")
			return c.File(filepath.Join(staticDir, "index.html"))
		}

		if target, ok := trailingSlashRedirectTarget(path, c.Request().URL.RawQuery); ok {
			canonicalPath := strings.TrimSuffix(path, "/")
			if _, staticPage := staticPagePath(staticDir, canonicalPath); staticPage || spaFallbackPath(canonicalPath) {
				return c.Redirect(http.StatusPermanentRedirect, target)
			}
		}

		if filePath, ok := staticPagePath(staticDir, path); ok {
			// 除 /assets/* 外的静态文件都不是内容哈希文件。HTML、robots、
			// sitemap、manifest、favicon、OG 图等更新后必须及时重新验证，
			// 统一使用 no-cache，避免浏览器/代理长期持有旧品牌或旧 SEO 数据。
			c.Response().Header().Set("Cache-Control", "no-cache")
			return c.File(filePath)
		}

		if spaFallbackPath(path) {
			fallback := filepath.Join(staticDir, "__spa-fallback.html")
			if !regularFile(fallback) {
				return echo.NewHTTPError(http.StatusNotFound, "SPA fallback not found")
			}
			c.Response().Header().Set("Cache-Control", "no-cache")
			c.Response().Header().Set("X-Robots-Tag", "noindex, nofollow")
			return c.File(fallback)
		}

		notFound := filepath.Join(staticDir, "404.html")
		if regularFile(notFound) {
			c.Response().Header().Set("Cache-Control", "no-cache")
			c.Response().Header().Set("X-Robots-Tag", "noindex, nofollow")
			c.Response().WriteHeader(http.StatusNotFound)
			return c.File(notFound)
		}

		return echo.NewHTTPError(http.StatusNotFound, "Page not found")
	})
}
