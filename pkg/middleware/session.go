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
		_, session, e := m.auth.Session(c.Request().Context(), cookie.Value)
		if e != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, model.ErrSessionExpired.ForLanguage(c.Request().Header.Get("Accept-Language")))
		}
		c.Set("user_id", session.UserID)
		c.Set("session", session)
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

func Session(c *echo.Context) *model.Session {
	v, ok := c.Get("session").(*model.Session)
	if !ok {
		return nil
	}

	return v
}
