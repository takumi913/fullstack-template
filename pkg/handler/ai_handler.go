// Package handler HTTP处理层
package handler

import (
	"io"
	"net/http"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v4"
)

// AIHandler AI任务HTTP处理器.
type AIHandler struct {
	replicateService service.ReplicateService
}

// NewAIHandler 创建AI任务HTTP处理器实例.
func NewAIHandler(replicateService service.ReplicateService) *AIHandler {
	return &AIHandler{
		replicateService: replicateService,
	}
}

// POST /api/v1/ai/translate-image.
func (h *AIHandler) TranslateImage(c echo.Context) error {
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	var req model.TranslateImageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	result, err := h.replicateService.CreateTranslateTask(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    result,
		"message": "任务创建成功",
	})
}

// POST /api/v1/ai/remove-watermark.
func (h *AIHandler) RemoveWatermark(c echo.Context) error {
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	var req model.RemoveWatermarkRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	result, err := h.replicateService.CreateWatermarkTask(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    result,
		"message": "任务创建成功",
	})
}

// GET /api/v1/ai/task/:id.
func (h *AIHandler) GetTask(c echo.Context) error {
	_, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	taskID := c.Param("id")
	if taskID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "任务ID不能为空",
		})
	}

	result, err := h.replicateService.PollTaskStatus(taskID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    result,
		"message": "获取成功",
	})
}

// GET /api/v1/ai/tasks.
func (h *AIHandler) GetTasks(c echo.Context) error {
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	var req model.AITaskListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	tasks, total, err := h.replicateService.GetUserTasks(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"tasks":     tasks,
			"total":     total,
			"page":      req.Page,
			"page_size": req.PageSize,
		},
		"message": "获取成功",
	})
}

// POST /api/v1/webhook/replicate.
func (h *AIHandler) ReplicateWebhook(c echo.Context) error {
	payload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "无法读取请求体",
		})
	}

	if err := h.replicateService.ProcessWebhook(payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"received": true,
	})
}
