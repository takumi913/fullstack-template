// Package service 业务逻辑层
package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"go-react-template/configs"
	"go-react-template/pkg/model"
)

// CreemService Creem支付服务接口.
type CreemService interface {
	CreateCheckoutSession(payment *model.Payment, userEmail string) (string, string, error)
	ValidateWebhookSignature(payload []byte, signature string) (*CreemWebhookEvent, error)
}

// creemService Creem支付服务实现.
type creemService struct {
	httpClient *http.Client
}

// NewCreemService 创建Creem支付服务实例.
func NewCreemService() CreemService {
	return &creemService{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// CreemCheckoutRequest Creem创建Checkout请求.
type CreemCheckoutRequest struct {
	ProductID  string            `json:"product_id"`
	SuccessURL string            `json:"success_url"`
	RequestID  string            `json:"request_id,omitempty"`
	Customer   *CreemCustomer    `json:"customer,omitempty"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Units      int               `json:"units,omitempty"`
}

// CreemCustomer Creem客户信息.
type CreemCustomer struct {
	Email string `json:"email,omitempty"`
}

// CreemCheckoutResponse Creem创建Checkout响应.
type CreemCheckoutResponse struct {
	ID          string `json:"id"`
	CheckoutURL string `json:"checkout_url"`
	Status      string `json:"status"`
}

// CreemWebhookEvent Creem Webhook事件.
type CreemWebhookEvent struct {
	EventType string                 `json:"event_type"`
	Object    map[string]interface{} `json:"object"`
}

// CreateCheckoutSession 创建Creem Checkout Session.
func (s *creemService) CreateCheckoutSession(payment *model.Payment, userEmail string) (string, string, error) {
	cfg := configs.AppConfig.Creem
	if cfg.APIKey == "" {
		return "", "", errors.New("Creem未配置")
	}

	if cfg.ProductID == "" {
		return "", "", errors.New("Creem产品ID未配置")
	}

	// 构建请求
	reqBody := CreemCheckoutRequest{
		ProductID:  cfg.ProductID,
		SuccessURL: cfg.SuccessURL,
		RequestID:  payment.ID,
		Metadata: map[string]string{
			"payment_id": payment.ID,
			"user_id":    payment.UserID,
			"amount":     payment.Amount.String(),
			"credits":    payment.CreditAmount.String(),
		},
		Units: 1,
	}

	if userEmail != "" {
		reqBody.Customer = &CreemCustomer{
			Email: userEmail,
		}
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", "", err
	}

	// 选择 API 地址
	apiURL := "https://api.creem.io/v1/checkouts"
	if cfg.TestMode {
		apiURL = "https://test-api.creem.io/v1/checkouts"
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", cfg.APIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", "", errors.New("调用Creem API失败: " + err.Error())
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", errors.New("读取Creem响应失败")
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", "", errors.New("Creem API返回错误: " + string(body))
	}

	var checkoutResp CreemCheckoutResponse
	if err := json.Unmarshal(body, &checkoutResp); err != nil {
		return "", "", errors.New("解析Creem响应失败")
	}

	return checkoutResp.ID, checkoutResp.CheckoutURL, nil
}

// ValidateWebhookSignature 验证Webhook签名并解析事件.
func (s *creemService) ValidateWebhookSignature(payload []byte, signature string) (*CreemWebhookEvent, error) {
	webhookSecret := configs.AppConfig.Creem.WebhookSecret
	if webhookSecret == "" {
		return nil, errors.New("creem Webhook密钥未配置")
	}

	// 计算 HMAC-SHA256 签名
	mac := hmac.New(sha256.New, []byte(webhookSecret))
	mac.Write(payload)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSignature), []byte(signature)) {
		return nil, errors.New("Webhook签名验证失败")
	}

	var event CreemWebhookEvent
	if err := json.Unmarshal(payload, &event); err != nil {
		return nil, errors.New("解析Webhook事件失败")
	}

	return &event, nil
}
