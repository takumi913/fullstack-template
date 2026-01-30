// Package service 业务逻辑层
package service

import (
	"errors"

	"go-react-template/configs"
	"go-react-template/pkg/model"

	"github.com/shopspring/decimal"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
)

// StripeService Stripe支付服务接口.
type StripeService interface {
	CreateCheckoutSession(payment *model.Payment, userEmail string) (string, string, error)
	ValidateWebhookSignature(payload []byte, signature string) (*stripe.Event, error)
}

// stripeService Stripe支付服务实现.
type stripeService struct{}

// NewStripeService 创建Stripe支付服务实例.
func NewStripeService() StripeService {
	stripe.Key = configs.AppConfig.Stripe.SecretKey
	return &stripeService{}
}

// CreateCheckoutSession 创建Stripe Checkout Session.
func (s *stripeService) CreateCheckoutSession(payment *model.Payment, userEmail string) (string, string, error) {
	if configs.AppConfig.Stripe.SecretKey == "" {
		return "", "", errors.New("Stripe未配置")
	}

	// 计算金额（Stripe使用最小货币单位，USD是分）
	amountCents := payment.Amount.Mul(decimal.NewFromInt(100)).IntPart()

	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String("Credits Top-up"),
						Description: stripe.String(payment.CreditAmount.String() + " credits"),
					},
					UnitAmount: stripe.Int64(amountCents),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(configs.AppConfig.Stripe.SuccessURL),
		CancelURL:  stripe.String(configs.AppConfig.Stripe.CancelURL),
		Metadata: map[string]string{
			"payment_id": payment.ID,
			"user_id":    payment.UserID,
		},
	}

	if userEmail != "" {
		params.CustomerEmail = stripe.String(userEmail)
	}

	sess, err := session.New(params)
	if err != nil {
		return "", "", err
	}

	return sess.ID, sess.URL, nil
}

// ValidateWebhookSignature 验证Webhook签名并解析事件.
func (s *stripeService) ValidateWebhookSignature(payload []byte, signature string) (*stripe.Event, error) {
	webhookSecret := configs.AppConfig.Stripe.WebhookSecret
	if webhookSecret == "" {
		return nil, errors.New("Webhook密钥未配置")
	}

	event, err := stripe.ConstructEvent(payload, signature, webhookSecret)
	if err != nil {
		return nil, err
	}

	return &event, nil
}
