// Package handler HTTP处理层
package handler

import (
	"net/http"
	"strconv"

	"go-react-template/pkg/model"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v4"
)

// AdminHandler 管理员HTTP处理器.
type AdminHandler struct {
	adminService service.AdminService
}

// NewAdminHandler 创建管理员HTTP处理器实例.
func NewAdminHandler(adminService service.AdminService) *AdminHandler {
	return &AdminHandler{
		adminService: adminService,
	}
}

// GET /api/v1/admin/stats.
func (h *AdminHandler) GetDashboardStats(c echo.Context) error {
	stats, err := h.adminService.GetDashboardStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    stats,
		"message": "获取成功",
	})
}

// GET /api/v1/admin/stats/users.
func (h *AdminHandler) GetUserGrowth(c echo.Context) error {
	days := 30

	if d := c.QueryParam("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	stats, err := h.adminService.GetUserGrowth(days)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    stats,
		"message": "获取成功",
	})
}

// GET /api/v1/admin/stats/revenue.
func (h *AdminHandler) GetRevenueGrowth(c echo.Context) error {
	days := 30

	if d := c.QueryParam("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	stats, err := h.adminService.GetRevenueGrowth(days)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    stats,
		"message": "获取成功",
	})
}

// POST /api/v1/admin/providers.
func (h *AdminHandler) CreateProvider(c echo.Context) error {
	var req model.AIProviderCreateRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	provider, err := h.adminService.CreateProvider(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    provider,
		"message": "创建成功",
	})
}

// GET /api/v1/admin/providers.
func (h *AdminHandler) ListProviders(c echo.Context) error {
	providers, err := h.adminService.ListProviders()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    providers,
		"message": "获取成功",
	})
}

// GET /api/v1/admin/providers/:id.
func (h *AdminHandler) GetProvider(c echo.Context) error {
	id := c.Param("id")

	provider, err := h.adminService.GetProvider(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    provider,
		"message": "获取成功",
	})
}

// PUT /api/v1/admin/providers/:id.
func (h *AdminHandler) UpdateProvider(c echo.Context) error {
	id := c.Param("id")

	var req model.AIProviderUpdateRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	provider, err := h.adminService.UpdateProvider(id, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    provider,
		"message": "更新成功",
	})
}

// DELETE /api/v1/admin/providers/:id.
func (h *AdminHandler) DeleteProvider(c echo.Context) error {
	id := c.Param("id")

	if err := h.adminService.DeleteProvider(id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    nil,
		"message": "删除成功",
	})
}

// PATCH /api/v1/admin/providers/:id/toggle.
func (h *AdminHandler) ToggleProvider(c echo.Context) error {
	id := c.Param("id")

	provider, err := h.adminService.ToggleProvider(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    provider,
		"message": "切换成功",
	})
}

// POST /api/v1/admin/models.
func (h *AdminHandler) CreateModel(c echo.Context) error {
	var req model.AIModelCreateRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	m, err := h.adminService.CreateModel(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    m,
		"message": "创建成功",
	})
}

// GET /api/v1/admin/models.
func (h *AdminHandler) ListModels(c echo.Context) error {
	models, err := h.adminService.ListModels()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    models,
		"message": "获取成功",
	})
}

// GET /api/v1/admin/models/:id.
func (h *AdminHandler) GetModel(c echo.Context) error {
	id := c.Param("id")

	m, err := h.adminService.GetModel(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    m,
		"message": "获取成功",
	})
}

// PUT /api/v1/admin/models/:id.
func (h *AdminHandler) UpdateModel(c echo.Context) error {
	id := c.Param("id")

	var req model.AIModelUpdateRequest

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	m, err := h.adminService.UpdateModel(id, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    m,
		"message": "更新成功",
	})
}

// DELETE /api/v1/admin/models/:id.
func (h *AdminHandler) DeleteModel(c echo.Context) error {
	id := c.Param("id")

	if err := h.adminService.DeleteModel(id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    nil,
		"message": "删除成功",
	})
}

// PATCH /api/v1/admin/models/:id/toggle.
func (h *AdminHandler) ToggleModel(c echo.Context) error {
	id := c.Param("id")

	m, err := h.adminService.ToggleModel(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    m,
		"message": "切换成功",
	})
}

// GET /api/v1/ai/models - 公开 API.
func (h *AdminHandler) GetPublicModels(c echo.Context) error {
	providerType := c.QueryParam("type")
	if providerType == "" {
		providerType = "image"
	}

	models, err := h.adminService.GetEnabledModelsByType(model.ProviderType(providerType))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    models,
		"message": "获取成功",
	})
}
