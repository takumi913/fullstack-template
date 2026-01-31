// Package service 业务逻辑层
package service

import (
	"bytes"
	"encoding/base64"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
)

// CloudflareService Cloudflare Worker AI服务接口.
type CloudflareService interface {
	CreateTranslateTask(userID string, req *model.TranslateImageRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
	CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error)
}

// cloudflareService Cloudflare Worker AI服务实现.
type cloudflareService struct {
	taskRepo   repo.AITaskRepo
	httpClient *http.Client
}

// NewCloudflareService 创建Cloudflare Worker AI服务实例.
func NewCloudflareService(taskRepo repo.AITaskRepo) CloudflareService {
	return &cloudflareService{
		taskRepo: taskRepo,
		httpClient: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// CreateTranslateTask 创建图片翻译任务（免费，同步处理）.
func (s *cloudflareService) CreateTranslateTask(userID string, req *model.TranslateImageRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	if provider.BaseURL == "" {
		return nil, errors.New("Cloudflare Worker AI未配置")
	}

	// 固定 prompt
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
		CreditsCost: m.CreditsPerUse, // 通常为0
		ProcessedAt: &now,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	outputURL, err := s.callCloudflareAPI(provider.BaseURL, req.ImageURL, prompt)
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
func (s *cloudflareService) CreateWatermarkTask(userID string, req *model.RemoveWatermarkRequest, provider *model.AIProvider, m *model.AIModel) (*model.AITaskResponse, error) {
	if provider.BaseURL == "" {
		return nil, errors.New("Cloudflare Worker AI未配置")
	}

	// 固定 prompt
	prompt := "Remove watermark from this image"

	now := time.Now()
	task := &model.AITask{
		UserID:      userID,
		Type:        model.AITaskTypeWatermark,
		Status:      model.AITaskStatusProcessing,
		InputURL:    req.ImageURL,
		ModelID:     m.ID,
		CreditsCost: m.CreditsPerUse, // 通常为0
		ProcessedAt: &now,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, errors.New("创建任务失败")
	}

	outputURL, err := s.callCloudflareAPI(provider.BaseURL, req.ImageURL, prompt)
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

// callCloudflareAPI 调用Cloudflare Worker API.
func (s *cloudflareService) callCloudflareAPI(baseURL, imageURL, prompt string) (string, error) {
	// 解码 base64 图片
	imageData, err := decodeBase64Image(imageURL)
	if err != nil {
		return "", errors.New("图片解码失败: " + err.Error())
	}

	// 构建 multipart/form-data 请求
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// 添加 prompt 字段
	if err := writer.WriteField("prompt", prompt); err != nil {
		return "", err
	}

	// 添加图片文件
	part, err := writer.CreateFormFile("image", "image.png")
	if err != nil {
		return "", err
	}

	if _, err := part.Write(imageData); err != nil {
		return "", err
	}

	if err := writer.Close(); err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", baseURL, body)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", errors.New("调用Cloudflare Worker失败: " + err.Error())
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body) //nolint:errcheck // 最佳努力读取错误信息

		return "", errors.New("Cloudflare Worker返回错误: " + string(respBody))
	}

	// 读取返回的图片数据
	imageBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("读取响应失败")
	}

	// 将图片转为 base64 data URL 返回
	base64Image := base64.StdEncoding.EncodeToString(imageBytes)
	dataURL := "data:image/png;base64," + base64Image

	return dataURL, nil
}

// decodeBase64Image 解码 base64 图片数据.
func decodeBase64Image(dataURL string) ([]byte, error) {
	// 移除 data URL 前缀
	parts := strings.SplitN(dataURL, ",", 2)
	if len(parts) != 2 {
		return nil, errors.New("无效的图片数据格式")
	}

	return base64.StdEncoding.DecodeString(parts[1])
}
