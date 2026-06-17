// Package handler HTTP处理层
package handler

import (
	"net/http"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v5"
)

// AIHandler AI任务HTTP处理器.
type AIHandler struct {
	grokService    service.GrokService
	bltcyService   service.BltcyService
	aiTaskService  service.AITaskService
	aiProviderRepo repo.AIProviderRepo
}

// NewAIHandler 创建AI任务HTTP处理器实例.
func NewAIHandler(grokService service.GrokService, bltcyService service.BltcyService, aiTaskService service.AITaskService, aiProviderRepo repo.AIProviderRepo) *AIHandler {
	return &AIHandler{
		grokService:    grokService,
		bltcyService:   bltcyService,
		aiTaskService:  aiTaskService,
		aiProviderRepo: aiProviderRepo,
	}
}

// POST /api/v1/ai/translate-image.
func (h *AIHandler) TranslateImage(c *echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.TranslateImageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	// 必须指定 model_id
	if req.ModelID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请选择模型",
		})
	}

	m, err := h.aiProviderRepo.GetModelByID(req.ModelID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "模型不存在",
		})
	}

	// 根据 Provider 名称路由到不同服务
	if m.Provider != nil && m.Provider.Name == "grok" {
		result, err := h.grokService.CreateTranslateTask(userID, &req, m.Provider, m)
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

	return c.JSON(http.StatusBadRequest, map[string]any{
		"code":    1,
		"data":    nil,
		"message": "不支持的服务提供商",
	})
}

// POST /api/v1/ai/remove-watermark.
func (h *AIHandler) RemoveWatermark(c *echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.RemoveWatermarkRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	// 必须指定 model_id
	if req.ModelID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "请选择模型",
		})
	}

	m, err := h.aiProviderRepo.GetModelByID(req.ModelID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "模型不存在",
		})
	}

	// 根据 Provider 名称路由到不同服务
	if m.Provider != nil && m.Provider.Name == "grok" {
		result, err := h.grokService.CreateWatermarkTask(userID, &req, m.Provider, m)
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

	return c.JSON(http.StatusBadRequest, map[string]any{
		"code":    1,
		"data":    nil,
		"message": "不支持的服务提供商",
	})
}

// GET /api/v1/ai/task/:id.
func (h *AIHandler) GetTask(c *echo.Context) error {
	taskID := c.Param("id")
	if taskID == "" {
		return c.JSON(http.StatusBadRequest, map[string]any{
			"code":    1,
			"data":    nil,
			"message": "任务ID不能为空",
		})
	}

	result, err := h.aiTaskService.GetTask(taskID)
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
func (h *AIHandler) GetTasks(c *echo.Context) error {
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

	tasks, total, err := h.aiTaskService.GetUserTasks(userID, &req)
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
