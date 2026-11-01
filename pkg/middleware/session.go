package middleware

import (
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/service"
	"net/http"

	"github.com/labstack/echo/v5"
)

const SessionCookie = "session_token"

type AuthMiddleware struct{ auth *service.AuthService }

func NewAuthMiddleware(a *service.AuthService) *AuthMiddleware { return &AuthMiddleware{auth: a} }
func (m *AuthMiddleware) Require(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		cookie, e := c.Cookie(SessionCookie)
		if e != nil || cookie.Value == "" {
			return echo.NewHTTPError(http.StatusUnauthorized, model.ErrUnauthenticated.ForLanguage(c.Request().Header.Get("Accept-Language")))
		}
		response, session, e := m.auth.Session(c.Request().Context(), cookie.Value)
		if e != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, model.ErrSessionExpired.ForLanguage(c.Request().Header.Get("Accept-Language")))
		}
		c.Set("user_id", session.UserID)
		c.Set("is_admin", response.User.IsAdmin)
		return next(c)
	}
}

// RequireAdmin must follow Require so each request uses the current database privilege.
func (m *AuthMiddleware) RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		if c.Get("is_admin") != true {
			return c.JSON(http.StatusForbidden, map[string]any{
				"code": 1, "data": nil,
				"message": model.ErrAdminRequired.ForLanguage(c.Request().Header.Get("Accept-Language")),
			})
		}
		return next(c)
	}
}
func UserID(c *echo.Context) string {
	v, ok := c.Get("user_id").(string)
	if !ok {
		return ""
	}

	return v
}
