// Package handler HTTP处理层，负责解析HTTP请求并返回响应
package handler

import (
	"io"
	"net/http"

	"go-react-template/pkg/middleware"
	"go-react-template/pkg/model"
	"go-react-template/pkg/service"

	"github.com/labstack/echo/v5"
)

// WalletHandler 钱包HTTP处理器.
type WalletHandler struct {
	walletService service.WalletService
}

// NewWalletHandler 创建钱包HTTP处理器实例.
func NewWalletHandler(walletService service.WalletService) *WalletHandler {
	return &WalletHandler{
		walletService: walletService,
	}
}

// GET /api/v1/wallet.
func (h *WalletHandler) GetBalance(c *echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	wallet, err := h.walletService.GetBalance(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    wallet,
		"message": "获取成功",
	})
}

// GET /api/v1/wallet/transactions.
func (h *WalletHandler) GetTransactions(c *echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.TransactionListRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	transactions, total, err := h.walletService.GetTransactions(userID, &req)
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
			"transactions": transactions,
			"total":        total,
			"page":         req.Page,
			"page_size":    req.PageSize,
		},
		"message": "获取成功",
	})
}

// POST /api/v1/wallet/topup.
func (h *WalletHandler) Topup(c *echo.Context) error {
	userID := middleware.GetUserIDFromSession(c)

	var req model.TopupRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    1,
			"data":    nil,
			"message": "请求参数格式错误",
		})
	}

	result, err := h.walletService.CreateTopupPayment(userID, &req)
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
		"message": "支付订单创建成功",
	})
}

// GET /api/v1/wallet/pricing.
func (h *WalletHandler) GetPricing(c *echo.Context) error {
	tiers := h.walletService.GetPricingTiers()

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    tiers,
		"message": "获取成功",
	})
}

// POST /api/v1/webhook/stripe.
func (h *WalletHandler) StripeWebhook(c *echo.Context) error {
	// 读取请求体
	payload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "无法读取请求体",
		})
	}

	// 获取 Stripe 签名头
	signature := c.Request().Header.Get("Stripe-Signature")
	if signature == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "缺少签名头",
		})
	}

	// 处理 Webhook
	if err := h.walletService.ProcessStripeWebhook(payload, signature); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"received": true,
	})
}

// POST /api/v1/webhook/creem.
func (h *WalletHandler) CreemWebhook(c *echo.Context) error {
	// 读取请求体
	payload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "无法读取请求体",
		})
	}

	// 获取 Creem 签名头
	signature := c.Request().Header.Get("creem-signature")
	if signature == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "缺少签名头",
		})
	}

	// 处理 Webhook
	if err := h.walletService.ProcessCreemWebhook(payload, signature); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"received": true,
	})
}
