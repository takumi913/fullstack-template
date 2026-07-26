package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"go-react-template/api"
	"go-react-template/configs"
	"go-react-template/db/migrations"
	"go-react-template/pkg/database"
	"go-react-template/pkg/handler"
	middleware2 "go-react-template/pkg/middleware"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

func main() {
	if err := configs.Init(); err != nil {
		log.Fatal("配置初始化失败:", err)
	}
	if err := database.Init(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}
	if err := migrations.Up(context.Background(), database.GetDB(), configs.AppConfig.Database.Driver); err != nil {
		_ = database.Close()
		log.Fatal("数据库迁移失败:", err)
	}

	store := repo.NewStore(database.GetDB(), configs.AppConfig.Database.Driver)
	authService := service.NewAuthService(store)
	userService := service.NewUserService(store)
	tenantService := service.NewTenantService(store)
	memberService := service.NewMemberService(store)
	handlers := api.Handlers{Auth: handler.NewAuthHandler(authService), User: handler.NewUserHandler(userService), Tenant: handler.NewTenantHandler(tenantService), Member: handler.NewMemberHandler(memberService)}
	authMiddleware := middleware2.NewAuthMiddleware(authService)
	tenantMiddleware := middleware2.NewTenantMiddleware(store)

	e := echo.New()
	// 限流按客户端 IP 计数。默认只信任连接来源；部署在反向代理后面时必须开启
	// TRUST_PROXY，否则所有用户会被算作同一个 IP，一个人触发限流会波及全部用户。
	if configs.AppConfig.Server.TrustProxy {
		e.IPExtractor = echo.ExtractIPFromXFFHeader()
	} else {
		e.IPExtractor = echo.ExtractIPDirect()
	}
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{LogStatus: true, LogURI: true, HandleError: true, LogValuesFunc: func(_ *echo.Context, v middleware.RequestLoggerValues) error {
		log.Printf("[%d] %s", v.Status, v.URI)
		return nil
	}}))
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{AllowOrigins: configs.AppConfig.Server.CORSOrigins, AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions}, AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept}, AllowCredentials: true}))
	api.SetupRoutes(e, handlers, authMiddleware, tenantMiddleware)
	setupStaticFiles(e)

	// SIGINT/SIGTERM 触发优雅关机（默认 10 秒宽限），之后统一关闭数据库连接。
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	sc := echo.StartConfig{Address: configs.AppConfig.GetServerAddress(), BeforeServeFunc: func(s *http.Server) error {
		s.ReadHeaderTimeout = 10 * time.Second
		s.ReadTimeout = 30 * time.Second
		s.WriteTimeout = 30 * time.Second
		s.IdleTimeout = 2 * time.Minute
		return nil
	}}
	// Start 会在收到信号后完成优雅关机再返回，正常关机返回 nil。
	err := sc.Start(ctx, e)
	stop()
	if closeErr := database.Close(); closeErr != nil {
		log.Printf("关闭数据库失败: %v", closeErr)
	}
	if err != nil {
		log.Printf("服务器异常退出: %v", err)
		os.Exit(1)
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

// setupStaticFiles 设置静态文件服务.
func setupStaticFiles(e *echo.Echo) {
	// 静态文件目录
	staticDir := "static"

	// 检查静态文件目录是否存在
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		log.Printf("警告: 静态文件目录 %s 不存在，跳过静态文件服务设置", staticDir)
		return
	}

	// 服务带有哈希的静态资源文件（长期缓存）
	e.GET("/assets/*", func(c *echo.Context) error {
		filePath := staticFilePath(staticDir, c.Request().URL.Path)
		if !regularFile(filePath) {
			return echo.NewHTTPError(http.StatusNotFound, "File not found")
		}
		// 设置强缓存：1年，因为文件名包含哈希值
		c.Response().Header().Set("Cache-Control", "public, max-age=31536000, immutable")

		return c.File(filePath)
	})

	// 服务 favicon（短期缓存）
	e.GET("/favicon.ico", func(c *echo.Context) error {
		c.Response().Header().Set("Cache-Control", "public, max-age=86400") // 1天
		return c.File(filepath.Join(staticDir, "favicon.ico"))
	})

	// 服务网站图标 SVG（长期缓存）
	e.GET("/vite.svg", func(c *echo.Context) error {
		c.Response().Header().Set("Cache-Control", "public, max-age=604800") // 7天
		return c.File(filepath.Join(staticDir, "vite.svg"))
	})

	// 处理SPA路由，所有非API请求都返回index.html
	e.GET("/*", func(c *echo.Context) error {
		path := c.Request().URL.Path

		// 如果是API请求，返回404
		if len(path) >= 4 && path[:4] == "/api" {
			return echo.NewHTTPError(http.StatusNotFound, "API endpoint not found")
		}

		// 检查请求的文件是否存在
		filePath := staticFilePath(staticDir, path)
		if path == "/" {
			filePath = filepath.Join(staticDir, "index.html")
		}

		if regularFile(filePath) {
			// 对于 HTML 文件，使用协商缓存
			if filepath.Ext(filePath) == ".html" {
				c.Response().Header().Set("Cache-Control", "no-cache")
			}

			return c.File(filePath)
		}

		// 文件不存在，返回index.html（SPA路由）
		c.Response().Header().Set("Cache-Control", "no-cache")

		return c.File(filepath.Join(staticDir, "index.html"))
	})
}
