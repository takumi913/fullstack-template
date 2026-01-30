// Package service 业务逻辑层
package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"go-react-template/configs"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"github.com/shopspring/decimal"
)

// ReplicateService Replicate AI服务接口.
type ReplicateService interface {
	CreateTranslateTask(userID string, req *model.TranslateImageRequest) (*model.AITaskResponse, error)
	CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest) (*model.AITaskResponse, error)
	GetTask(taskID string) (*model.AITaskResponse, error)
	GetUserTasks(userID string, req *model.AITaskListRequest) ([]model.AITaskResponse, int64, error)
	ProcessWebhook(payload []byte) error
	PollTaskStatus(taskID string) (*model.AITaskResponse, error)
}

// replicateService Replicate AI服务实现.
type replicateService struct {
	taskRepo      repo.AITaskRepo
	walletService WalletService
	httpClient    *http.Client
}

// NewReplicateService 创建Replicate AI服务实例.
func NewReplicateService(taskRepo repo.AITaskRepo, walletService WalletService) ReplicateService {
	return &replicateService{
		taskRepo:      taskRepo,
		walletService: walletService,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// replicatePredictionRequest Replicate API请求结构.
type replicatePredictionRequest struct {
	Version string                 `json:"version"`
	Input   map[string]interface{} `json:"input"`
	Webhook string                 `json:"webhook,omitempty"`
}

// replicatePredictionResponse Replicate API响应结构.
type replicatePredictionResponse struct {
	ID     string      `json:"id"`
	Status string      `json:"status"`
	Output interface{} `json:"output"`
	Error  string      `json:"error"`
}

// CreateTranslateTask 创建图片翻译任务.
func (s *replicateService) CreateTranslateTask(userID string, req *model.TranslateImageRequest) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Replicate
	if cfg.APIToken == "" {
		return nil, errors.New("Replicate API未配置")
	}

	cost := cfg.TranslateCostPerUse

	wallet, err := s.walletService.GetBalance(userID)
	if err != nil {
		return nil, err
	}

	balance, _ := decimal.NewFromString(wallet.Balance) //nolint:errcheck
	if balance.LessThan(decimal.NewFromInt(int64(cost))) {
		return nil, errors.New("余额不足")
	}

	task := &model.AITask{
		UserID:      userID,
		Type:        model.AITaskTypeTranslate,
		Status:      model.AITaskStatusPending,
		InputURL:    req.ImageURL,
		SourceLang:  req.SourceLang,
		TargetLang:  req.TargetLang,
		CreditsCost: cost,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	replicateID, err := s.callReplicateAPI(cfg.TranslateModel, map[string]interface{}{
		"image":       req.ImageURL,
		"source_lang": req.SourceLang,
		"target_lang": req.TargetLang,
	}, task.ID)
	if err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = err.Error()
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	if err := s.walletService.Consume(userID, decimal.NewFromInt(int64(cost)), "图片翻译", task.ID); err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = "扣除积分失败"
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	now := time.Now()
	task.ReplicateID = replicateID
	task.Status = model.AITaskStatusProcessing
	task.ProcessedAt = &now
	_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

	resp := task.ToResponse()

	return &resp, nil
}

// CreateWatermarkTask 创建水印去除任务.
func (s *replicateService) CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Replicate
	if cfg.APIToken == "" {
		return nil, errors.New("Replicate API未配置")
	}

	cost := cfg.WatermarkCostPerUse

	wallet, err := s.walletService.GetBalance(userID)
	if err != nil {
		return nil, err
	}

	balance, _ := decimal.NewFromString(wallet.Balance) //nolint:errcheck
	if balance.LessThan(decimal.NewFromInt(int64(cost))) {
		return nil, errors.New("余额不足")
	}

	task := &model.AITask{
		UserID:      userID,
		Type:        model.AITaskTypeWatermark,
		Status:      model.AITaskStatusPending,
		InputURL:    req.ImageURL,
		CreditsCost: cost,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	replicateID, err := s.callReplicateAPI(cfg.WatermarkModel, map[string]interface{}{
		"image": req.ImageURL,
	}, task.ID)
	if err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = err.Error()
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	if err := s.walletService.Consume(userID, decimal.NewFromInt(int64(cost)), "水印去除", task.ID); err != nil {
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = "扣除积分失败"
		_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

		return nil, err
	}

	now := time.Now()
	task.ReplicateID = replicateID
	task.Status = model.AITaskStatusProcessing
	task.ProcessedAt = &now
	_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新

	resp := task.ToResponse()

	return &resp, nil
}

// callReplicateAPI 调用Replicate API创建预测.
func (s *replicateService) callReplicateAPI(modelVersion string, input map[string]interface{}, taskID string) (string, error) {
	cfg := configs.AppConfig.Replicate

	reqBody := replicatePredictionRequest{
		Version: modelVersion,
		Input:   input,
	}

	if cfg.WebhookURL != "" {
		reqBody.Webhook = cfg.WebhookURL + "?task_id=" + taskID
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.replicate.com/v1/predictions", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Token "+cfg.APIToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Replicate API错误: %s", string(body))
	}

	var predResp replicatePredictionResponse

	if err := json.Unmarshal(body, &predResp); err != nil {
		return "", err
	}

	return predResp.ID, nil
}

// GetTask 获取任务详情.
func (s *replicateService) GetTask(taskID string) (*model.AITaskResponse, error) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return nil, errors.New("任务不存在")
	}

	resp := task.ToResponse()

	return &resp, nil
}

// GetUserTasks 获取用户任务列表.
func (s *replicateService) GetUserTasks(userID string, req *model.AITaskListRequest) ([]model.AITaskResponse, int64, error) {
	page := req.Page
	if page < 1 {
		page = 1
	}

	pageSize := req.PageSize
	if pageSize < 1 {
		pageSize = 20
	}

	tasks, total, err := s.taskRepo.GetByUserID(userID, page, pageSize, req.Type, req.Status)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]model.AITaskResponse, len(tasks))
	for i, task := range tasks {
		responses[i] = task.ToResponse()
	}

	return responses, total, nil
}

// PollTaskStatus 轮询任务状态（用于无Webhook场景）.
func (s *replicateService) PollTaskStatus(taskID string) (*model.AITaskResponse, error) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return nil, errors.New("任务不存在")
	}

	if task.Status == model.AITaskStatusCompleted || task.Status == model.AITaskStatusFailed {
		resp := task.ToResponse()

		return &resp, nil
	}

	if task.ReplicateID != "" {
		predResp, err := s.getReplicatePrediction(task.ReplicateID)
		if err == nil {
			s.updateTaskFromPrediction(task, predResp)
		}
	}

	resp := task.ToResponse()

	return &resp, nil
}

// getReplicatePrediction 获取Replicate预测状态.
func (s *replicateService) getReplicatePrediction(predictionID string) (*replicatePredictionResponse, error) {
	cfg := configs.AppConfig.Replicate

	req, err := http.NewRequest("GET", "https://api.replicate.com/v1/predictions/"+predictionID, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Token "+cfg.APIToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var predResp replicatePredictionResponse

	if err := json.Unmarshal(body, &predResp); err != nil {
		return nil, err
	}

	return &predResp, nil
}

// updateTaskFromPrediction 根据Replicate响应更新任务.
func (s *replicateService) updateTaskFromPrediction(task *model.AITask, pred *replicatePredictionResponse) {
	now := time.Now()

	switch pred.Status {
	case "succeeded":
		task.Status = model.AITaskStatusCompleted
		task.CompletedAt = &now

		if output, ok := pred.Output.(string); ok {
			task.OutputURL = output
		} else if outputs, ok := pred.Output.([]interface{}); ok && len(outputs) > 0 {
			if url, ok := outputs[0].(string); ok {
				task.OutputURL = url
			}
		}
	case "failed":
		task.Status = model.AITaskStatusFailed
		task.ErrorMessage = pred.Error
		task.CompletedAt = &now
	case "processing", "starting":
		task.Status = model.AITaskStatusProcessing
	}

	_ = s.taskRepo.Update(task) //nolint:errcheck // 最佳努力更新
}

// ProcessWebhook 处理Replicate Webhook回调.
func (s *replicateService) ProcessWebhook(payload []byte) error {
	var pred replicatePredictionResponse

	if err := json.Unmarshal(payload, &pred); err != nil {
		return err
	}

	task, err := s.taskRepo.GetByReplicateID(pred.ID)
	if err != nil {
		return errors.New("任务不存在")
	}

	s.updateTaskFromPrediction(task, &pred)

	return nil
}
