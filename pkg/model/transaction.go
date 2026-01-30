// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// TransactionType 交易类型枚举.
type TransactionType string

const (
	TransactionTypeTopup    TransactionType = "topup"    // 充值
	TransactionTypeConsume  TransactionType = "consume"  // 消费
	TransactionTypeRefund   TransactionType = "refund"   // 退款
	TransactionTypeGift     TransactionType = "gift"     // 赠送
	TransactionTypeTransfer TransactionType = "transfer" // 转账
)

// TransactionStatus 交易状态枚举.
type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "pending"   // 待处理
	TransactionStatusCompleted TransactionStatus = "completed" // 已完成
	TransactionStatusFailed    TransactionStatus = "failed"    // 失败
	TransactionStatusCanceled  TransactionStatus = "canceled"  // 已取消
)

// Transaction 交易记录模型.
type Transaction struct {
	ID            string            `json:"id" gorm:"type:char(36);primarykey"`
	WalletID      string            `json:"wallet_id" gorm:"type:char(36);index;not null"`
	Type          TransactionType   `json:"type" gorm:"type:varchar(20);not null"`
	Status        TransactionStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	Amount        decimal.Decimal   `json:"amount" gorm:"type:decimal(10,2);not null"`
	BalanceBefore decimal.Decimal   `json:"balance_before" gorm:"type:decimal(10,2);not null"`
	BalanceAfter  decimal.Decimal   `json:"balance_after" gorm:"type:decimal(10,2);not null"`
	Description   string            `json:"description" gorm:"type:varchar(255)"`
	Reference     string            `json:"reference" gorm:"type:varchar(100);index"` // 关联的订单/支付ID
	Metadata      string            `json:"metadata" gorm:"type:text"`                // JSON格式的额外数据
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`

	// 关联
	Wallet Wallet `json:"-" gorm:"foreignKey:WalletID"`
}

// TableName 指定表名.
func (Transaction) TableName() string {
	return "transactions"
}

// BeforeCreate 在创建前生成UUID.
func (t *Transaction) BeforeCreate(_ *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}

	return nil
}

// TransactionResponse 交易记录响应结构.
type TransactionResponse struct {
	ID            string            `json:"id"`
	Type          TransactionType   `json:"type"`
	Status        TransactionStatus `json:"status"`
	Amount        string            `json:"amount"`
	BalanceBefore string            `json:"balance_before"`
	BalanceAfter  string            `json:"balance_after"`
	Description   string            `json:"description"`
	Reference     string            `json:"reference"`
	CreatedAt     time.Time         `json:"created_at"`
}

// ToResponse 将Transaction转换为TransactionResponse.
func (t *Transaction) ToResponse() TransactionResponse {
	return TransactionResponse{
		ID:            t.ID,
		Type:          t.Type,
		Status:        t.Status,
		Amount:        t.Amount.String(),
		BalanceBefore: t.BalanceBefore.String(),
		BalanceAfter:  t.BalanceAfter.String(),
		Description:   t.Description,
		Reference:     t.Reference,
		CreatedAt:     t.CreatedAt,
	}
}

// TransactionListRequest 交易记录列表请求.
type TransactionListRequest struct {
	Page     int             `query:"page" validate:"omitempty,min=1"`
	PageSize int             `query:"page_size" validate:"omitempty,min=1,max=100"`
	Type     TransactionType `query:"type" validate:"omitempty,oneof=topup consume refund gift transfer"`
}
