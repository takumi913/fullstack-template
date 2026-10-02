package handler

import (
	"fullstack-template/pkg/middleware"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/service"

	"github.com/labstack/echo/v5"
)

type UserHandler struct{ service *service.UserService }

func NewUserHandler(s *service.UserService) *UserHandler { return &UserHandler{service: s} }
func (h *UserHandler) Get(c *echo.Context) error {
	v, e := h.service.Get(c.Request().Context(), middleware.UserID(c))
	if e != nil {
		return failure(c, 404, e)
	}
	return success(c, v, model.MessageLoaded)
}
func (h *UserHandler) Update(c *echo.Context) error {
	var req model.UpdateProfileRequest
	if e := c.Bind(&req); e != nil {
		return failure(c, 400, e)
	}
	v, e := h.service.Update(c.Request().Context(), middleware.UserID(c), req)
	if e != nil {
		return failure(c, 400, e)
	}
	return success(c, v, model.MessageUpdated)
}
func (h *UserHandler) ChangePassword(c *echo.Context) error {
	var req model.ChangePasswordRequest
	if e := c.Bind(&req); e != nil {
		return failure(c, 400, e)
	}
	if e := h.service.ChangePassword(c.Request().Context(), middleware.UserID(c), req); e != nil {
		return failure(c, 400, e)
	}
	return success(c, nil, model.MessagePasswordChanged)
}
