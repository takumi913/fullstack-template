// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ProviderType AI Provider 类型枚举.
type ProviderType string

const (
	ProviderTypeLLM   ProviderType = "llm"   // 大语言模型
	ProviderTypeImage ProviderType = "image" // 图像生成/处理
)

// AIProvider AI服务提供商模型.
type AIProvider struct {
	ID          string         `json:"id" gorm:"type:char(36);primarykey"`
	Name        string         `json:"name" gorm:"uniqueIndex;not null;size:50;comment:唯一标识符"`
	DisplayName string         `json:"display_name" gorm:"not null;size:100;comment:显示名称"`
	Type        ProviderType   `json:"type" gorm:"type:varchar(20);not null;comment:提供商类型"`
	BaseURL     string         `json:"base_url" gorm:"size:500;comment:API基础URL"`
	APIKey      string         `json:"-" gorm:"size:500;comment:API密钥"`
	IsEnabled   bool           `json:"is_enabled" gorm:"default:true;comment:是否启用"`
	Priority    int            `json:"priority" gorm:"default:0;comment:优先级"`
	Config      string         `json:"config" gorm:"type:text;comment:JSON额外配置"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Models      []AIModel      `json:"models,omitempty" gorm:"foreignKey:ProviderID"`
}

// TableName 指定表名.
func (AIProvider) TableName() string {
	return "ai_providers"
}

// BeforeCreate 在创建前生成UUID.
func (p *AIProvider) BeforeCreate(_ *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}

	return nil
}

// AIProviderCreateRequest 创建Provider请求.
type AIProviderCreateRequest struct {
	Name        string       `json:"name" validate:"required,min=2,max=50"`
	DisplayName string       `json:"display_name" validate:"required,min=2,max=100"`
	Type        ProviderType `json:"type" validate:"required,oneof=llm image"`
	BaseURL     string       `json:"base_url" validate:"omitempty,url"`
	APIKey      string       `json:"api_key" validate:"omitempty"`
	IsEnabled   bool         `json:"is_enabled"`
	Priority    int          `json:"priority"`
	Config      string       `json:"config"`
}

// AIProviderUpdateRequest 更新Provider请求.
type AIProviderUpdateRequest struct {
	DisplayName *string       `json:"display_name" validate:"omitempty,min=2,max=100"`
	Type        *ProviderType `json:"type" validate:"omitempty,oneof=llm image"`
	BaseURL     *string       `json:"base_url" validate:"omitempty"`
	APIKey      *string       `json:"api_key" validate:"omitempty"`
	IsEnabled   *bool         `json:"is_enabled"`
	Priority    *int          `json:"priority"`
	Config      *string       `json:"config"`
}

// AIProviderResponse Provider响应结构.
type AIProviderResponse struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	DisplayName string       `json:"display_name"`
	Type        ProviderType `json:"type"`
	BaseURL     string       `json:"base_url"`
	HasAPIKey   bool         `json:"has_api_key"`
	IsEnabled   bool         `json:"is_enabled"`
	Priority    int          `json:"priority"`
	Config      string       `json:"config"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

// ToResponse 将AIProvider转换为AIProviderResponse.
func (p *AIProvider) ToResponse() AIProviderResponse {
	return AIProviderResponse{
		ID:          p.ID,
		Name:        p.Name,
		DisplayName: p.DisplayName,
		Type:        p.Type,
		BaseURL:     p.BaseURL,
		HasAPIKey:   p.APIKey != "",
		IsEnabled:   p.IsEnabled,
		Priority:    p.Priority,
		Config:      p.Config,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}
