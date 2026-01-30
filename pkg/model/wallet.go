// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// Wallet 用户钱包模型.
type Wallet struct {
	ID        string          `json:"id" gorm:"type:char(36);primarykey"`
	UserID    string          `json:"user_id" gorm:"type:char(36);uniqueIndex;not null"`
	Balance   decimal.Decimal `json:"balance" gorm:"type:decimal(10,2);not null;default:0"`
	Currency  string          `json:"currency" gorm:"type:varchar(3);not null;default:'USD'"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`

	// 关联
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName 指定表名.
func (Wallet) TableName() string {
	return "wallets"
}

// BeforeCreate 在创建前生成UUID.
func (w *Wallet) BeforeCreate(_ *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}

	return nil
}

// WalletResponse 钱包响应结构.
type WalletResponse struct {
	ID       string `json:"id"`
	Balance  string `json:"balance"`
	Currency string `json:"currency"`
}

// ToResponse 将Wallet转换为WalletResponse.
func (w *Wallet) ToResponse() WalletResponse {
	return WalletResponse{
		ID:       w.ID,
		Balance:  w.Balance.String(),
		Currency: w.Currency,
	}
}
