package handler

import (
	"log/slog"
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
		// 带上 request_id，便于和访问日志中的同一条请求对应起来。
		slog.Error("请求处理失败",
			"status", status,
			"method", c.Request().Method,
			"path", c.Request().URL.Path,
			"request_id", c.Response().Header().Get(echo.HeaderXRequestID),
			"error", err)
		message = "服务器内部错误"
	}
	return c.JSON(status, map[string]any{"code": 1, "data": nil, "message": message})
}
