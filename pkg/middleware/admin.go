package middleware

import (
	"net/http"

	"go-react-template/pkg/repo"

	"github.com/labstack/echo/v4"
)

// AdminAuth 管理员认证中间件.
func AdminAuth() echo.MiddlewareFunc {
	userRepo := repo.NewUserRepo()

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 从context中获取用户ID（由Session中间件设置）
			userID, ok := c.Get("user_id").(string)
			if !ok || userID == "" {
				return echo.NewHTTPError(http.StatusUnauthorized, "用户未认证")
			}

			// 获取用户信息
			user, err := userRepo.GetByID(userID)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "用户不存在")
			}

			// 检查用户角色
			if user.Role != "admin" {
				return echo.NewHTTPError(http.StatusForbidden, "权限不足")
			}

			return next(c)
		}
	}
}
