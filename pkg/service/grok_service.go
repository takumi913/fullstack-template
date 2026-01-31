// Package service 业务逻辑层
package service

import (
	"errors"
	"net/http"
	"time"

	"go-react-template/configs"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
)

// GrokService Grok AI服务接口（OpenAI兼容）.
type GrokService interface {
	CreateTranslateTask(userID string, req *model.TranslateImageRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
	CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
}

// grokService Grok AI服务实现.
type grokService struct {
	taskRepo   repo.AITaskRepo
	httpClient *http.Client
}

// NewGrokService 创建Grok AI服务实例.
func NewGrokService(taskRepo repo.AITaskRepo) GrokService {
	return &grokService{
		taskRepo: taskRepo,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

// CreateTranslateTask 创建图片翻译任务（免费，同步处理）.
func (s *grokService) CreateTranslateTask(userID string, req *model.TranslateImageRequest, _ *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Grok
	if cfg.APIKey == "" {
		return nil, errors.New("Grok API未配置")
	}

	prompt := "Translate text in this image from " + req.SourceLang + " to " + req.TargetLang

	now := time.Now()
	task := &model.AITask{
		UserID:      userID,
		Type:        model.AITaskTypeTranslate,
		Status:      model.AITaskStatusProcessing,
		InputURL:    req.ImageURL,
		SourceLang:  req.SourceLang,
		TargetLang:  req.TargetLang,
		ModelID:     m.ID,
		CreditsCost: m.CreditsPerUse,
		ProcessedAt: &now,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	compatCfg := OpenAICompatConfig{
		APIKey:  cfg.APIKey,
		BaseURL: cfg.BaseURL,
		Model:   cfg.Model,
	}

	outputURL, err := CallOpenAICompatImageEdit(s.httpClient, compatCfg, req.ImageURL, prompt, m.Name, "Grok")
	if err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = err.Error()
		completedAt := time.Now()
		task.CompletedAt = &completedAt
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	completedAt := time.Now()
	task.Status = model.AITaskStatusCompleted
	task.OutputURL = outputURL
	task.CompletedAt = &completedAt
	_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

	resp := task.ToResponse()

	return &resp, nil
}

// CreateWatermarkTask 创建水印去除任务（免费，同步处理）.
func (s *grokService) CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, _ *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Grok
	if cfg.APIKey == "" {
		return nil, errors.New("Grok API未配置")
	}

	prompt := "Remove watermark from this image"

	now := time.Now()
	task := &model.AITask{
		UserID:      userID,
		Type:        model.AITaskTypeWatermark,
		Status:      model.AITaskStatusProcessing,
		InputURL:    req.ImageURL,
		ModelID:     m.ID,
		CreditsCost: m.CreditsPerUse,
		ProcessedAt: &now,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	compatCfg := OpenAICompatConfig{
		APIKey:  cfg.APIKey,
		BaseURL: cfg.BaseURL,
		Model:   cfg.Model,
	}

	outputURL, err := CallOpenAICompatImageEdit(s.httpClient, compatCfg, req.ImageURL, prompt, m.Name, "Grok")
	if err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = err.Error()
		completedAt := time.Now()
		task.CompletedAt = &completedAt
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	completedAt := time.Now()
	task.Status = model.AITaskStatusCompleted
	task.OutputURL = outputURL
	task.CompletedAt = &completedAt
	_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

	resp := task.ToResponse()

	return &resp, nil
}
