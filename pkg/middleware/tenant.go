package middleware

import (
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"net/http"

	"github.com/labstack/echo/v5"
)

type TenantMiddleware struct{ store *repo.Store }

func NewTenantMiddleware(s *repo.Store) *TenantMiddleware { return &TenantMiddleware{store: s} }
func (m *TenantMiddleware) Member(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		member, e := m.store.GetMember(c.Request().Context(), c.Param("tenantID"), UserID(c))
		if e != nil {
			return echo.NewHTTPError(http.StatusForbidden, "您不是该租户成员")
		}
		c.Set("tenant_member", member)
		return next(c)
	}
}
func Require(permission model.Permission) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			member, ok := c.Get("tenant_member").(*model.TenantMember)
			if !ok || member == nil || !model.HasPermission(member.Role, permission) {
				return echo.NewHTTPError(http.StatusForbidden, "权限不足")
			}
			return next(c)
		}
	}
}
func TenantMember(c *echo.Context) *model.TenantMember {
	v, ok := c.Get("tenant_member").(*model.TenantMember)
	if !ok {
		return nil
	}
	return v
}
