package api

import (
	"go-react-template/pkg/handler"
	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	echomw "github.com/labstack/echo/v5/middleware"
)

type Handlers struct {
	Auth   *handler.AuthHandler
	User   *handler.UserHandler
	Tenant *handler.TenantHandler
	Member *handler.MemberHandler
}

func SetupRoutes(e *echo.Echo, h Handlers, auth *middleware.AuthMiddleware, tenant *middleware.TenantMiddleware) {
	v1 := e.Group("/api/v1")
	v1.GET("/health", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]any{"code": 0, "data": map[string]string{"status": "healthy"}, "message": "服务正常运行"})
	})
	// 未认证的凭据接口按 IP 限流，缓解暴力破解和 bcrypt CPU 消耗。
	authLimiter := echomw.RateLimiter(echomw.NewRateLimiterMemoryStoreWithConfig(echomw.RateLimiterMemoryStoreConfig{Rate: 5, Burst: 20, ExpiresIn: 3 * time.Minute}))
	v1.POST("/auth/register", h.Auth.Register, authLimiter)
	v1.POST("/auth/login", h.Auth.Login, authLimiter)
	protected := v1.Group("", auth.Require)
	protected.POST("/auth/logout", h.Auth.Logout)
	protected.GET("/auth/session", h.Auth.Session)
	protected.GET("/user/profile", h.User.Get)
	protected.PATCH("/user/profile", h.User.Update)
	protected.POST("/user/change-password", h.User.ChangePassword)
	protected.GET("/tenants", h.Tenant.List)
	protected.POST("/tenants", h.Tenant.Create)
	t := protected.Group("/tenants/:tenantID", tenant.Member)
	t.GET("", h.Tenant.Get, middleware.Require(model.PermissionTenantRead))
	t.PATCH("", h.Tenant.Update, middleware.Require(model.PermissionTenantUpdate))
	t.DELETE("", h.Tenant.Delete, middleware.Require(model.PermissionTenantDelete))
	t.POST("/select", h.Tenant.Select, middleware.Require(model.PermissionTenantRead))
	t.GET("/members", h.Member.List, middleware.Require(model.PermissionMemberRead))
	t.POST("/members", h.Member.Add, middleware.Require(model.PermissionMemberCreate))
	t.PATCH("/members/:userID", h.Member.Update, middleware.Require(model.PermissionMemberUpdate))
	t.DELETE("/members/:userID", h.Member.Delete, middleware.Require(model.PermissionMemberDelete))
}
