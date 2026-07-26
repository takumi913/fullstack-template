package handler

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
)

func success(c *echo.Context, data any, message string) error {
	return c.JSON(http.StatusOK, map[string]any{"code": 0, "data": data, "message": message})
}
func failure(c *echo.Context, status int, err error) error {
	message := err.Error()
	// 5xx 属于内部错误，原始信息（SQL、驱动报错等）只记日志，不回传给客户端。
	if status >= http.StatusInternalServerError {
		log.Printf("[%d] %s %s: %v", status, c.Request().Method, c.Request().URL.Path, err)
		message = "服务器内部错误"
	}
	return c.JSON(status, map[string]any{"code": 1, "data": nil, "message": message})
}
