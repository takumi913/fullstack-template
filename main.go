package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"go-react-template/api"
	"go-react-template/configs"
	"go-react-template/pkg/database"
	"go-react-template/pkg/handler"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// 初始化配置
	if err := configs.Init(); err != nil {
		log.Fatal("配置初始化失败:", err)
	}

	// 初始化数据库
	if err := database.Init(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}

	// 执行数据库迁移
	if err := database.AutoMigrate(
		&model.User{},
		&model.Wallet{},
		&model.Transaction{},
		&model.Payment{},
		&model.AITask{},
		&model.AIProvider{},
		&model.AIModel{},
	); err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	// 初始化依赖
	userRepo := repo.NewUserRepo()
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	walletRepo := repo.NewWalletRepo()
	stripeService := service.NewStripeService()
	creemService := service.NewCreemService()
	walletService := service.NewWalletService(walletRepo, userRepo, stripeService, creemService)
	walletHandler := handler.NewWalletHandler(walletService)

	adminRepo := repo.NewAdminRepo()
	aiProviderRepo := repo.NewAIProviderRepo()
	adminService := service.NewAdminService(adminRepo, aiProviderRepo)
	adminHandler := handler.NewAdminHandler(adminService)

	aiTaskRepo := repo.NewAITaskRepo()
	grokService := service.NewGrokService(aiTaskRepo)
	bltcyService := service.NewBltcyService(aiTaskRepo, walletService)
	aiTaskService := service.NewAITaskService(aiTaskRepo)
	aiHandler := handler.NewAIHandler(grokService, bltcyService, aiTaskService, aiProviderRepo)

	// 创建Echo实例
	e := echo.New()

	// 添加中间件
	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogStatus:   true,
		LogURI:      true,
		LogError:    true,
		HandleError: true,
		LogValuesFunc: func(_ echo.Context, v middleware.RequestLoggerValues) error {
			if v.Error == nil {
				log.Printf("[%d] %s", v.Status, v.URI)
			} else {
				log.Printf("[%d] %s - %v", v.Status, v.URI, v.Error)
			}
			return nil
		},
	}))
	e.Use(middleware.Recover())
	// 启用 Gzip 压缩
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5, // 压缩级别 1-9，5 是性能和压缩率的平衡
		Skipper: func(c echo.Context) bool {
			// 跳过已经压缩的资源（如图片）
			path := c.Request().URL.Path
			return strings.HasSuffix(path, ".png") ||
				strings.HasSuffix(path, ".jpg") ||
				strings.HasSuffix(path, ".jpeg") ||
				strings.HasSuffix(path, ".gif") ||
				strings.HasSuffix(path, ".webp") ||
				strings.HasSuffix(path, ".ico")
		},
	}))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-Language"},
		AllowCredentials: true,
	}))

	// 设置API路由
	api.SetupRoutes(e, userHandler, walletHandler, aiHandler, adminHandler)

	// 设置静态文件服务
	setupStaticFiles(e)

	serverAddr := configs.AppConfig.GetServerAddress()
	log.Printf("服务器启动在地址 %s", serverAddr)
	e.Logger.Fatal(e.Start(serverAddr))
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
	e.GET("/assets/*", func(c echo.Context) error {
		filePath := filepath.Join(staticDir, c.Request().URL.Path)
		if _, err := os.Stat(filePath); err != nil {
			return echo.NewHTTPError(http.StatusNotFound, "File not found")
		}
		// 设置强缓存：1年，因为文件名包含哈希值
		c.Response().Header().Set("Cache-Control", "public, max-age=31536000, immutable")

		return c.File(filePath)
	})

	// 服务 favicon（短期缓存）
	e.GET("/favicon.ico", func(c echo.Context) error {
		c.Response().Header().Set("Cache-Control", "public, max-age=86400") // 1天
		return c.File(filepath.Join(staticDir, "favicon.ico"))
	})

	// 服务网站图标 SVG（长期缓存）
	e.GET("/vite.svg", func(c echo.Context) error {
		c.Response().Header().Set("Cache-Control", "public, max-age=604800") // 7天
		return c.File(filepath.Join(staticDir, "vite.svg"))
	})

	// 处理SPA路由，所有非API请求都返回index.html
	e.GET("/*", func(c echo.Context) error {
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
