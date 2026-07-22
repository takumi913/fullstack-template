package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"path/filepath"

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
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{LogStatus: true, LogURI: true, HandleError: true, LogValuesFunc: func(_ *echo.Context, v middleware.RequestLoggerValues) error {
		log.Printf("[%d] %s", v.Status, v.URI)
		return nil
	}}))
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{AllowOrigins: []string{"http://localhost:5173", "http://localhost:3000"}, AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions}, AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept}, AllowCredentials: true}))
	api.SetupRoutes(e, handlers, authMiddleware, tenantMiddleware)
	setupStaticFiles(e)
	if err := e.Start(configs.AppConfig.GetServerAddress()); err != nil {
		_ = database.Close()
		log.Fatal(err)
	}
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
		filePath := filepath.Join(staticDir, c.Request().URL.Path)
		if _, err := os.Stat(filePath); err != nil {
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
		filePath := filepath.Join(staticDir, path)
		if path == "/" {
			filePath = filepath.Join(staticDir, "index.html")
		}

		if _, err := os.Stat(filePath); err == nil {
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
