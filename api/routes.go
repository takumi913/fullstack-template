// Package api 存放API路由定义
package api

import (
	"go-react-template/pkg/handler"
	"go-react-template/pkg/middleware"

	"github.com/labstack/echo/v4"
)

// SetupRoutes 设置所有API路由.
func SetupRoutes(e *echo.Echo, userHandler *handler.UserHandler, walletHandler *handler.WalletHandler, aiHandler *handler.AIHandler, adminHandler *handler.AdminHandler) {
	// API v1 路由组
	api := e.Group("/api/v1")

	// 设置公开路由（无需认证）
	setupPublicRoutes(api, userHandler, walletHandler, adminHandler)

	// 设置受保护路由（需要认证）
	setupProtectedRoutes(api, userHandler, walletHandler, aiHandler)

	// 设置管理员路由（需要认证 + 管理员权限）
	setupAdminRoutes(api, adminHandler)

	// 设置 Webhook 路由
	setupWebhookRoutes(api, walletHandler, aiHandler)
}

// setupPublicRoutes 设置公开路由（无需认证）.
func setupPublicRoutes(api *echo.Group, userHandler *handler.UserHandler, walletHandler *handler.WalletHandler, adminHandler *handler.AdminHandler) {
	// 健康检查
	api.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"success": true,
			"data": map[string]interface{}{
				"status":  "healthy",
				"service": "go-react-template",
				"version": "1.0.0",
			},
			"message": "服务正常运行",
		})
	})

	// 认证相关路由（公开）
	auth := api.Group("/auth")
	auth.POST("/register", userHandler.Register)
	auth.POST("/login", userHandler.Login)
	auth.POST("/google", userHandler.GoogleLogin) // Google第三方登录

	// 定价信息（公开）
	api.GET("/pricing", walletHandler.GetPricing)

	// AI 模型列表（公开）
	api.GET("/ai/models", adminHandler.GetPublicModels)
}

// setupProtectedRoutes 设置受保护路由（需要认证）.
func setupProtectedRoutes(api *echo.Group, userHandler *handler.UserHandler, walletHandler *handler.WalletHandler, aiHandler *handler.AIHandler) {
	// 创建受保护的路由组，应用Session中间件
	protected := api.Group("", middleware.Session())

	// 受保护的认证路由
	protectedAuth := protected.Group("/auth")
	protectedAuth.POST("/logout", userHandler.Logout) // 用户注销

	// 受保护的用户路由
	userRoutes := protected.Group("/user")
	userRoutes.GET("/profile", userHandler.GetProfile)              // 获取当前用户资料
	userRoutes.PUT("/profile", userHandler.UpdateProfile)           // 更新个人资料
	userRoutes.POST("/change-password", userHandler.ChangePassword) // 更改密码

	// 钱包路由
	walletRoutes := protected.Group("/wallet")
	walletRoutes.GET("", walletHandler.GetBalance)                   // 获取钱包余额
	walletRoutes.GET("/transactions", walletHandler.GetTransactions) // 获取交易记录
	walletRoutes.POST("/topup", walletHandler.Topup)                 // 充值

	// AI 任务路由
	aiRoutes := protected.Group("/ai")
	aiRoutes.POST("/translate-image", aiHandler.TranslateImage)   // 图片翻译
	aiRoutes.POST("/remove-watermark", aiHandler.RemoveWatermark) // 水印去除
	aiRoutes.GET("/task/:id", aiHandler.GetTask)                  // 获取任务详情
	aiRoutes.GET("/tasks", aiHandler.GetTasks)                    // 获取任务列表
}

// setupAdminRoutes 设置管理员路由（需要认证 + 管理员权限）.
func setupAdminRoutes(api *echo.Group, adminHandler *handler.AdminHandler) {
	// 创建管理员路由组，应用 Session + AdminAuth 中间件
	admin := api.Group("/admin", middleware.Session(), middleware.AdminAuth())

	// 统计数据
	admin.GET("/stats", adminHandler.GetDashboardStats)
	admin.GET("/stats/users", adminHandler.GetUserGrowth)
	admin.GET("/stats/revenue", adminHandler.GetRevenueGrowth)

	// Provider 管理
	admin.POST("/providers", adminHandler.CreateProvider)
	admin.GET("/providers", adminHandler.ListProviders)
	admin.GET("/providers/:id", adminHandler.GetProvider)
	admin.PUT("/providers/:id", adminHandler.UpdateProvider)
	admin.DELETE("/providers/:id", adminHandler.DeleteProvider)
	admin.PATCH("/providers/:id/toggle", adminHandler.ToggleProvider)

	// Model 管理
	admin.POST("/models", adminHandler.CreateModel)
	admin.GET("/models", adminHandler.ListModels)
	admin.GET("/models/:id", adminHandler.GetModel)
	admin.PUT("/models/:id", adminHandler.UpdateModel)
	admin.DELETE("/models/:id", adminHandler.DeleteModel)
	admin.PATCH("/models/:id/toggle", adminHandler.ToggleModel)
}

// setupWebhookRoutes 设置 Webhook 路由（无需认证，但需验证签名）.
func setupWebhookRoutes(api *echo.Group, walletHandler *handler.WalletHandler, aiHandler *handler.AIHandler) {
	webhook := api.Group("/webhook")
	webhook.POST("/stripe", walletHandler.StripeWebhook)
	webhook.POST("/creem", walletHandler.CreemWebhook)
	webhook.POST("/replicate", aiHandler.ReplicateWebhook)
}
