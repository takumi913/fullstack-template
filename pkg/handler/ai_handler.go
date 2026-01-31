// Package handler HTTP处理层
package handler

import (
	"io"
	"net/http"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v4"
)

// AIHandler AI任务HTTP处理器.
type AIHandler struct {
	replicateService  service.ReplicateService
	cloudflareService service.CloudflareService
	bltcyService      service.BltcyService
	aiProviderRepo    repo.AIProviderRepo
}

// NewAIHandler 创建AI任务HTTP处理器实例.
func NewAIHandler(replicateService service.ReplicateService, cloudflareService service.CloudflareService, bltcyService service.BltcyService, aiProviderRepo repo.AIProviderRepo) *AIHandler {
	return &AIHandler{
		replicateService:  replicateService,
		cloudflareService: cloudflareService,
		bltcyService:      bltcyService,
		aiProviderRepo:    aiProviderRepo,
	}
}

// POST /api/v1/ai/translate-image.
func (h *AIHandler) TranslateImage(c echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.TranslateImageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	// 如果指定了 model_id，查询 Provider 类型进行路由
	if req.ModelID != "" {
		m, err := h.aiProviderRepo.GetModelByID(req.ModelID)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"code":    1,
				"data":    nil,
				"message": "模型不存在",
			})
		}

		// 根据 Provider 名称路由到不同服务
		if m.Provider != nil && m.Provider.Name == "cloudflare" {
			result, err := h.cloudflareService.CreateTranslateTask(userID, &req, m.Provider, m)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]any{
					"code":    1,
					"data":    nil,
					"message": err.Error(),
				})
			}

			return c.JSON(http.StatusOK, map[string]any{
				"code":    0,
				"data":    result,
				"message": "处理成功",
			})
		}

		// Bltcy Provider（OpenAI兼容）
		if m.Provider != nil && m.Provider.Name == "bltcy" {
			result, err := h.bltcyService.CreateTranslateTask(userID, &req, m.Provider, m)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]any{
					"code":    1,
					"data":    nil,
					"message": err.Error(),
				})
			}

			return c.JSON(http.StatusOK, map[string]any{
				"code":    0,
				"data":    result,
				"message": "处理成功",
			})
		}
	}

	// 默认使用 Replicate 服务
	result, err := h.replicateService.CreateTranslateTask(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"code":    0,
		"data":    result,
		"message": "任务创建成功",
	})
}

// POST /api/v1/ai/remove-watermark.
func (h *AIHandler) RemoveWatermark(c echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.RemoveWatermarkRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	// 如果指定了 model_id，查询 Provider 类型进行路由
	if req.ModelID != "" {
		m, err := h.aiProviderRepo.GetModelByID(req.ModelID)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]any{
				"code":    1,
				"data":    nil,
				"message": "模型不存在",
			})
		}

		// 根据 Provider 名称路由到不同服务
		if m.Provider != nil && m.Provider.Name == "cloudflare" {
			result, err := h.cloudflareService.CreateWatermarkTask(userID, &req, m.Provider, m)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]any{
					"code":    1,
					"data":    nil,
					"message": err.Error(),
				})
			}

			return c.JSON(http.StatusOK, map[string]any{
				"code":    0,
				"data":    result,
				"message": "处理成功",
			})
		}

		// Bltcy Provider（OpenAI兼容）
		if m.Provider != nil && m.Provider.Name == "bltcy" {
			result, err := h.bltcyService.CreateWatermarkTask(userID, &req, m.Provider, m)
			if err != nil {
				return c.JSON(http.StatusBadRequest, map[string]any{
					"code":    1,
					"data":    nil,
					"message": err.Error(),
				})
			}

			return c.JSON(http.StatusOK, map[string]any{
				"code":    0,
				"data":    result,
				"message": "处理成功",
			})
		}
	}

	// 默认使用 Replicate 服务
	result, err := h.replicateService.CreateWatermarkTask(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"code":    0,
		"data":    result,
		"message": "任务创建成功",
	})
}

// GET /api/v1/ai/task/:id.
func (h *AIHandler) GetTask(c echo.Context) error {
	taskID := c.Param("id")
	if taskID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "任务ID不能为空",
		})
	}

	result, err := h.replicateService.PollTaskStatus(taskID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]any{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"code":    0,
		"data":    result,
		"message": "获取成功",
	})
}

// GET /api/v1/ai/tasks.
func (h *AIHandler) GetTasks(c echo.Context) error {
	userID, err := middleware.ExtractUserIDFromSession(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "未授权访问",
		})
	}

	var req model.AITaskListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	tasks, total, err := h.replicateService.GetUserTasks(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]any{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"code": 0,
		"data": map[string]any{
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
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": "无法读取请求体",
		})
	}

	if err := h.replicateService.ProcessWebhook(payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"received": true,
	})
}
