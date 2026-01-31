// Package model 定义数据模型
package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AITaskType AI任务类型枚举.
type AITaskType string

const (
	AITaskTypeTranslate AITaskType = "translate" // 图片翻译
	AITaskTypeWatermark AITaskType = "watermark" // 水印去除
)

// AITaskStatus AI任务状态枚举.
type AITaskStatus string

const (
	AITaskStatusPending    AITaskStatus = "pending"    // 等待处理
	AITaskStatusProcessing AITaskStatus = "processing" // 处理中
	AITaskStatusCompleted  AITaskStatus = "completed"  // 已完成
	AITaskStatusFailed     AITaskStatus = "failed"     // 失败
)

// AITask AI任务模型.
type AITask struct {
	ID           string       `json:"id" gorm:"type:char(36);primarykey"`
	UserID       string       `json:"user_id" gorm:"type:char(36);index;not null"`
	Type         AITaskType   `json:"type" gorm:"type:varchar(20);not null"`
	Status       AITaskStatus `json:"status" gorm:"type:varchar(20);not null;default:'pending'"`
	InputURL     string       `json:"input_url" gorm:"type:varchar(500);not null"` // 输入图片URL
	OutputURL    string       `json:"output_url" gorm:"type:varchar(500)"`         // 输出图片URL
	ReplicateID  string       `json:"replicate_id" gorm:"type:varchar(100);index"` // Replicate预测ID
	SourceLang   string       `json:"source_lang" gorm:"type:varchar(10)"`         // 源语言 (翻译任务)
	TargetLang   string       `json:"target_lang" gorm:"type:varchar(10)"`         // 目标语言 (翻译任务)
	ModelID      string       `json:"model_id" gorm:"type:char(36);index"`         // 使用的模型ID
	CreditsCost  int          `json:"credits_cost" gorm:"default:0"`               // 消耗积分
	ErrorMessage string       `json:"error_message" gorm:"type:text"`              // 错误信息
	ProcessedAt  *time.Time   `json:"processed_at"`                                // 开始处理时间
	CompletedAt  *time.Time   `json:"completed_at"`                                // 完成时间
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`

	// 关联
	User User `json:"-" gorm:"foreignKey:UserID"`
}

// TableName 指定表名.
func (AITask) TableName() string {
	return "ai_tasks"
}

// BeforeCreate 在创建前生成UUID.
func (t *AITask) BeforeCreate(_ *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}

	return nil
}

// AITaskResponse AI任务响应结构.
type AITaskResponse struct {
	ID           string       `json:"id"`
	Type         AITaskType   `json:"type"`
	Status       AITaskStatus `json:"status"`
	InputURL     string       `json:"input_url"`
	OutputURL    string       `json:"output_url,omitempty"`
	SourceLang   string       `json:"source_lang,omitempty"`
	TargetLang   string       `json:"target_lang,omitempty"`
	CreditsCost  int          `json:"credits_cost"`
	ErrorMessage string       `json:"error_message,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
	CompletedAt  *time.Time   `json:"completed_at,omitempty"`
}

// ToResponse 将AITask转换为AITaskResponse.
func (t *AITask) ToResponse() AITaskResponse {
	return AITaskResponse{
		ID:           t.ID,
		Type:         t.Type,
		Status:       t.Status,
		InputURL:     t.InputURL,
		OutputURL:    t.OutputURL,
		SourceLang:   t.SourceLang,
		TargetLang:   t.TargetLang,
		CreditsCost:  t.CreditsCost,
		ErrorMessage: t.ErrorMessage,
		CreatedAt:    t.CreatedAt,
		CompletedAt:  t.CompletedAt,
	}
}

// TranslateImageRequest 图片翻译请求.
type TranslateImageRequest struct {
	ImageURL   string `json:"image_url" validate:"required"`
	SourceLang string `json:"source_lang" validate:"required"`
	TargetLang string `json:"target_lang" validate:"required"`
	ModelID    string `json:"model_id"` // 可选，指定使用的模型
}

// RemoveWatermarkRequest 水印去除请求.
type RemoveWatermarkRequest struct {
	ImageURL string `json:"image_url" validate:"required"`
	ModelID  string `json:"model_id"` // 可选，指定使用的模型
}

// AITaskListRequest AI任务列表请求.
type AITaskListRequest struct {
	Page     int          `query:"page"`
	PageSize int          `query:"page_size"`
	Type     AITaskType   `query:"type"`
	Status   AITaskStatus `query:"status"`
}
