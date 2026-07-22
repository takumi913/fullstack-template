package handler

import (
	"net/http"

	"github.com/labstack/echo/v5"
)

func success(c *echo.Context, data any, message string) error {
	return c.JSON(http.StatusOK, map[string]any{"code": 0, "data": data, "message": message})
}
func failure(c *echo.Context, status int, err error) error {
	return c.JSON(status, map[string]any{"code": 1, "data": nil, "message": err.Error()})
}
