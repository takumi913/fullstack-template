// Package service 业务逻辑层
package service

import (
	"errors"
	"net/http"
	"time"

	"go-react-template/configs"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"github.com/shopspring/decimal"
)

// BltcyService Bltcy AI服务接口（OpenAI兼容）.
type BltcyService interface {
	CreateTranslateTask(userID string, req *model.TranslateImageRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
	CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
}

// bltcyService Bltcy AI服务实现.
type bltcyService struct {
	taskRepo      repo.AITaskRepo
	walletService WalletService
	httpClient    *http.Client
}

// NewBltcyService 创建Bltcy AI服务实例.
func NewBltcyService(taskRepo repo.AITaskRepo, walletService WalletService) BltcyService {
	return &bltcyService{
		taskRepo:      taskRepo,
		walletService: walletService,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
	}
}

// CreateTranslateTask 创建图片翻译任务.
func (s *bltcyService) CreateTranslateTask(userID string, req *model.TranslateImageRequest, _ *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Bltcy
	if cfg.APIKey == "" {
		return nil, errors.New("bltcy API未配置")
	}

	// 检查并扣除积分
	if m.CreditsPerUse > 0 {
		if err := s.walletService.Consume(userID, intToDecimal(m.CreditsPerUse), "图片翻译 - "+m.DisplayName, ""); err != nil {
			return nil, errors.New("积分不足: " + err.Error())
		}
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

	outputURL, err := CallOpenAICompatImageEdit(s.httpClient, compatCfg, req.ImageURL, prompt, m.Name, "Bltcy")
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

// CreateWatermarkTask 创建水印去除任务.
func (s *bltcyService) CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, _ *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Bltcy
	if cfg.APIKey == "" {
		return nil, errors.New("bltcy API未配置")
	}

	// 检查并扣除积分
	if m.CreditsPerUse > 0 {
		if err := s.walletService.Consume(userID, intToDecimal(m.CreditsPerUse), "水印去除 - "+m.DisplayName, ""); err != nil {
			return nil, errors.New("积分不足: " + err.Error())
		}
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

	outputURL, err := CallOpenAICompatImageEdit(s.httpClient, compatCfg, req.ImageURL, prompt, m.Name, "Bltcy")
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

// intToDecimal 将int转换为decimal.Decimal.
func intToDecimal(i int) decimal.Decimal {
	return decimal.NewFromInt(int64(i))
}
