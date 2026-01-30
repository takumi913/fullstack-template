// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AIModel AI模型.
type AIModel struct {
	ID            string         `json:"id" gorm:"type:char(36);primarykey"`
	ProviderID    string         `json:"provider_id" gorm:"type:char(36);not null;index;comment:关联Provider"`
	Name          string         `json:"name" gorm:"not null;size:100;comment:模型标识符"`
	DisplayName   string         `json:"display_name" gorm:"not null;size:100;comment:显示名称"`
	CreditsPerUse int            `json:"credits_per_use" gorm:"default:1;comment:每次消耗积分"`
	IsEnabled     bool           `json:"is_enabled" gorm:"default:true;comment:是否启用"`
	IsDefault     bool           `json:"is_default" gorm:"default:false;comment:是否默认"`
	Config        string         `json:"config" gorm:"type:text;comment:JSON额外配置"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
	Provider      *AIProvider    `json:"provider,omitempty" gorm:"foreignKey:ProviderID"`
}

// TableName 指定表名.
func (AIModel) TableName() string {
	return "ai_models"
}

// BeforeCreate 在创建前生成UUID.
func (m *AIModel) BeforeCreate(_ *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}

	return nil
}

// AIModelCreateRequest 创建Model请求.
type AIModelCreateRequest struct {
	ProviderID    string `json:"provider_id" validate:"required,uuid"`
	Name          string `json:"name" validate:"required,min=2,max=100"`
	DisplayName   string `json:"display_name" validate:"required,min=2,max=100"`
	CreditsPerUse int    `json:"credits_per_use" validate:"min=0"`
	IsEnabled     bool   `json:"is_enabled"`
	IsDefault     bool   `json:"is_default"`
	Config        string `json:"config"`
}

// AIModelUpdateRequest 更新Model请求.
type AIModelUpdateRequest struct {
	ProviderID    *string `json:"provider_id" validate:"omitempty,uuid"`
	Name          *string `json:"name" validate:"omitempty,min=2,max=100"`
	DisplayName   *string `json:"display_name" validate:"omitempty,min=2,max=100"`
	CreditsPerUse *int    `json:"credits_per_use" validate:"omitempty,min=0"`
	IsEnabled     *bool   `json:"is_enabled"`
	IsDefault     *bool   `json:"is_default"`
	Config        *string `json:"config"`
}

// AIModelResponse Model响应结构.
type AIModelResponse struct {
	ID            string              `json:"id"`
	ProviderID    string              `json:"provider_id"`
	Name          string              `json:"name"`
	DisplayName   string              `json:"display_name"`
	CreditsPerUse int                 `json:"credits_per_use"`
	IsEnabled     bool                `json:"is_enabled"`
	IsDefault     bool                `json:"is_default"`
	Config        string              `json:"config"`
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
	Provider      *AIProviderResponse `json:"provider,omitempty"`
}

// ToResponse 将AIModel转换为AIModelResponse.
func (m *AIModel) ToResponse() AIModelResponse {
	resp := AIModelResponse{
		ID:            m.ID,
		ProviderID:    m.ProviderID,
		Name:          m.Name,
		DisplayName:   m.DisplayName,
		CreditsPerUse: m.CreditsPerUse,
		IsEnabled:     m.IsEnabled,
		IsDefault:     m.IsDefault,
		Config:        m.Config,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
	}

	if m.Provider != nil {
		providerResp := m.Provider.ToResponse()
		resp.Provider = &providerResp
	}

	return resp
}

// PublicAIModelResponse 公开的Model响应结构（用于前端工具页面）.
type PublicAIModelResponse struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	DisplayName   string `json:"display_name"`
	CreditsPerUse int    `json:"credits_per_use"`
	ProviderName  string `json:"provider_name"`
}

// ToPublicResponse 将AIModel转换为PublicAIModelResponse.
func (m *AIModel) ToPublicResponse() PublicAIModelResponse {
	providerName := ""

	if m.Provider != nil {
		providerName = m.Provider.DisplayName
	}

	return PublicAIModelResponse{
		ID:            m.ID,
		Name:          m.Name,
		DisplayName:   m.DisplayName,
		CreditsPerUse: m.CreditsPerUse,
		ProviderName:  providerName,
	}
}
