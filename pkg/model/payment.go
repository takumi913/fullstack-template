// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// PaymentProvider 支付提供商枚举.
type PaymentProvider string

const (
	PaymentProviderStripe PaymentProvider = "stripe"
	PaymentProviderCreem  PaymentProvider = "creem"
)

// PaymentStatus 支付状态枚举.
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"   // 待支付
	PaymentStatusCompleted PaymentStatus = "completed" // 已完成
	PaymentStatusFailed    PaymentStatus = "failed"    // 失败
	PaymentStatusRefunded  PaymentStatus = "refunded"  // 已退款
	PaymentStatusExpired   PaymentStatus = "expired"   // 已过期
)

// Payment 支付订单模型.
type Payment struct {
	ID              string          `json:"id" gorm:"type:char(36);primarykey"`
	UserID          string          `json:"user_id" gorm:"type:char(36);index;not null"`
	WalletID        string          `json:"wallet_id" gorm:"type:char(36);index;not null"`
	Provider        PaymentProvider `json:"provider" gorm:"type:varchar(20);not null"`
	Status          PaymentStatus   `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	Amount          decimal.Decimal `json:"amount" gorm:"type:decimal(10,2);not null"` // 支付金额
	Currency        string          `json:"currency" gorm:"type:varchar(3);not null;default:'USD'"`
	CreditAmount    decimal.Decimal `json:"credit_amount" gorm:"type:decimal(10,2);not null"` // 到账积分/余额
	ExternalID      string          `json:"external_id" gorm:"type:varchar(255);index"`       // 第三方支付ID
	CheckoutURL     string          `json:"checkout_url" gorm:"type:varchar(500)"`            // 支付链接
	WebhookReceived bool            `json:"webhook_received" gorm:"default:false"`            // 是否收到webhook
	Metadata        string          `json:"metadata" gorm:"type:text"`                        // JSON格式的额外数据
	ExpiresAt       *time.Time      `json:"expires_at"`                                       // 过期时间
	CompletedAt     *time.Time      `json:"completed_at"`                                     // 完成时间
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`

	// 关联
	User   User   `json:"-" gorm:"foreignKey:UserID"`
	Wallet Wallet `json:"-" gorm:"foreignKey:WalletID"`
}

// TableName 指定表名.
func (Payment) TableName() string {
	return "payments"
}

// BeforeCreate 在创建前生成UUID.
func (p *Payment) BeforeCreate(_ *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}

	return nil
}

// PaymentResponse 支付订单响应结构.
type PaymentResponse struct {
	ID           string          `json:"id"`
	Provider     PaymentProvider `json:"provider"`
	Status       PaymentStatus   `json:"status"`
	Amount       string          `json:"amount"`
	Currency     string          `json:"currency"`
	CreditAmount string          `json:"credit_amount"`
	CheckoutURL  string          `json:"checkout_url,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
	CompletedAt  *time.Time      `json:"completed_at,omitempty"`
}

// ToResponse 将Payment转换为PaymentResponse.
func (p *Payment) ToResponse() PaymentResponse {
	return PaymentResponse{
		ID:           p.ID,
		Provider:     p.Provider,
		Status:       p.Status,
		Amount:       p.Amount.String(),
		Currency:     p.Currency,
		CreditAmount: p.CreditAmount.String(),
		CheckoutURL:  p.CheckoutURL,
		CreatedAt:    p.CreatedAt,
		CompletedAt:  p.CompletedAt,
	}
}

// TopupRequest 充值请求结构.
type TopupRequest struct {
	Amount   decimal.Decimal `json:"amount" validate:"required,gt=0"`
	Provider PaymentProvider `json:"provider" validate:"required,oneof=stripe creem"`
}

// TopupResponse 充值响应结构.
type TopupResponse struct {
	PaymentID   string `json:"payment_id"`
	CheckoutURL string `json:"checkout_url"`
}

// PricingTier 定价层级.
type PricingTier struct {
	Amount      decimal.Decimal `json:"amount"`      // 支付金额
	Credits     decimal.Decimal `json:"credits"`     // 获得积分
	BonusRate   float64         `json:"bonus_rate"`  // 赠送比例
	Description string          `json:"description"` // 描述
	Popular     bool            `json:"popular"`     // 是否热门
}

// GetPricingTiers 获取定价层级列表.
func GetPricingTiers() []PricingTier {
	return []PricingTier{
		{
			Amount:      decimal.NewFromInt(5),
			Credits:     decimal.NewFromInt(500),
			BonusRate:   0,
			Description: "Starter",
		},
		{
			Amount:      decimal.NewFromInt(10),
			Credits:     decimal.NewFromInt(1100),
			BonusRate:   0.10,
			Description: "Basic",
		},
		{
			Amount:      decimal.NewFromInt(20),
			Credits:     decimal.NewFromInt(2400),
			BonusRate:   0.20,
			Description: "Standard",
			Popular:     true,
		},
		{
			Amount:      decimal.NewFromInt(50),
			Credits:     decimal.NewFromInt(6500),
			BonusRate:   0.30,
			Description: "Pro",
		},
		{
			Amount:      decimal.NewFromInt(100),
			Credits:     decimal.NewFromInt(14000),
			BonusRate:   0.40,
			Description: "Enterprise",
		},
	}
}
