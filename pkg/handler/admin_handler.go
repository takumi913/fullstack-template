package handler

import (
	"errors"
	"net/http"

	"fullstack-template/pkg/middleware"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/service"

	"github.com/labstack/echo/v5"
)

// AdminHandler exposes platform account management behind the administrator guard.
type AdminHandler struct{ service *service.AdminService }

// NewAdminHandler creates the platform account handler.
func NewAdminHandler(s *service.AdminService) *AdminHandler { return &AdminHandler{service: s} }

// List returns a page of users matching the administrator's search.
func (h *AdminHandler) List(c *echo.Context) error {
	var req model.ListUsersRequest
	if err := c.Bind(&req); err != nil {
		return failure(c, http.StatusBadRequest, err)
	}
	v, err := h.service.List(c.Request().Context(), req)
	if err != nil {
		if errors.Is(err, model.ErrPagination) {
			return failure(c, http.StatusBadRequest, err)
		}
		return failure(c, http.StatusInternalServerError, err)
	}
	return success(c, v, model.MessageLoaded)
}

// SetStatus enables or disables a regular account.
func (h *AdminHandler) SetStatus(c *echo.Context) error {
	var req model.UpdateUserStatusRequest
	if err := c.Bind(&req); err != nil {
		return failure(c, http.StatusBadRequest, err)
	}
	v, err := h.service.SetStatus(c.Request().Context(), middleware.UserID(c), c.Param("userID"), req)
	if err != nil {
		switch {
		case errors.Is(err, model.ErrUserNotFound):
			return failure(c, http.StatusNotFound, err)
		case errors.Is(err, model.ErrAdminProtected):
			return failure(c, http.StatusForbidden, err)
		case errors.Is(err, model.ErrUserStatus):
			return failure(c, http.StatusBadRequest, err)
		default:
			return failure(c, http.StatusInternalServerError, err)
		}
	}
	return success(c, v, model.MessageUpdated)
}
