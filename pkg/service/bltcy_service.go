// Package service 业务逻辑层
package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
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

// BltcyImageEditResponse OpenAI images/edits API响应.
type BltcyImageEditResponse struct {
	Created int64 `json:"created"`
	Data    []struct {
		URL     string `json:"url,omitempty"`
		B64JSON string `json:"b64_json,omitempty"`
	} `json:"data"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

// CreateTranslateTask 创建图片翻译任务.
func (s *bltcyService) CreateTranslateTask(userID string, req *model.TranslateImageRequest, _ *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	cfg := configs.AppConfig.Bltcy
	if cfg.APIKey == "" {
		return nil, errors.New("Bltcy API未配置")
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

	outputURL, err := s.callBltcyAPI(req.ImageURL, prompt, m.Name)
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
		return nil, errors.New("Bltcy API未配置")
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

	outputURL, err := s.callBltcyAPI(req.ImageURL, prompt, m.Name)
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

// callBltcyAPI 调用Bltcy API（OpenAI兼容的images/edits接口）.
//
//nolint:gocyclo // API调用需要处理多种情况
func (s *bltcyService) callBltcyAPI(imageURL, prompt, modelName string) (string, error) {
	cfg := configs.AppConfig.Bltcy

	// 解码 base64 图片
	imageData, err := decodeBase64Image(imageURL)
	if err != nil {
		return "", errors.New("图片解码失败: " + err.Error())
	}

	// 构建请求
	req, contentType, err := s.buildBltcyRequest(imageData, prompt, modelName, cfg)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", "Bearer "+cfg.APIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", errors.New("调用Bltcy API失败: " + err.Error())
	}
	defer resp.Body.Close()

	return s.parseBltcyResponse(resp)
}

// buildBltcyRequest 构建Bltcy API请求.
func (s *bltcyService) buildBltcyRequest(imageData []byte, prompt, modelName string, cfg configs.BltcyConfig) (*http.Request, string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	if err := writer.WriteField("prompt", prompt); err != nil {
		return nil, "", err
	}

	model := modelName
	if model == "" {
		model = cfg.Model
	}

	if err := writer.WriteField("model", model); err != nil {
		return nil, "", err
	}

	if err := writer.WriteField("response_format", "b64_json"); err != nil {
		return nil, "", err
	}

	part, err := writer.CreateFormFile("image", "image.png")
	if err != nil {
		return nil, "", err
	}

	if _, err := part.Write(imageData); err != nil {
		return nil, "", err
	}

	if err := writer.Close(); err != nil {
		return nil, "", err
	}

	apiURL := cfg.BaseURL + "/images/edits"

	req, err := http.NewRequest("POST", apiURL, body)
	if err != nil {
		return nil, "", err
	}

	return req, writer.FormDataContentType(), nil
}

// parseBltcyResponse 解析Bltcy API响应.
func (s *bltcyService) parseBltcyResponse(resp *http.Response) (string, error) {
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("读取响应失败")
	}

	if resp.StatusCode != http.StatusOK {
		return "", errors.New("Bltcy API返回错误: " + string(respBody))
	}

	var editResp BltcyImageEditResponse
	if err := json.Unmarshal(respBody, &editResp); err != nil {
		return "", errors.New("解析响应失败: " + err.Error())
	}

	if editResp.Error != nil {
		return "", errors.New("API错误: " + editResp.Error.Message)
	}

	if len(editResp.Data) == 0 {
		return "", errors.New("API未返回图片数据")
	}

	if editResp.Data[0].B64JSON != "" {
		return "data:image/png;base64," + editResp.Data[0].B64JSON, nil
	}

	if editResp.Data[0].URL != "" {
		return editResp.Data[0].URL, nil
	}

	return "", errors.New("API未返回有效的图片数据")
}

// intToDecimal 将int转换为decimal.Decimal.
func intToDecimal(i int) decimal.Decimal {
	return decimal.NewFromInt(int64(i))
}
