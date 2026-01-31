// Package service 业务逻辑层
package service

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
)

// OpenAICompatConfig OpenAI兼容API配置.
type OpenAICompatConfig struct {
	APIKey  string
	BaseURL string
	Model   string
}

// OpenAIImageEditResponse OpenAI images/edits API响应.
type OpenAIImageEditResponse struct {
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

// CallOpenAICompatImageEdit 调用OpenAI兼容的images/edits接口.
func CallOpenAICompatImageEdit(client *http.Client, cfg OpenAICompatConfig, imageURL, prompt, modelName, providerName string) (string, error) {
	// 解码 base64 图片
	imageData, err := decodeBase64Image(imageURL)
	if err != nil {
		return "", errors.New("图片解码失败: " + err.Error())
	}

	// 构建请求
	req, contentType, err := buildOpenAICompatRequest(cfg, imageData, prompt, modelName)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", "Bearer "+cfg.APIKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", errors.New("调用" + providerName + " API失败: " + err.Error())
	}
	defer resp.Body.Close()

	return parseOpenAICompatResponse(resp, providerName)
}

// buildOpenAICompatRequest 构建OpenAI兼容API请求.
func buildOpenAICompatRequest(cfg OpenAICompatConfig, imageData []byte, prompt, modelName string) (*http.Request, string, error) {
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

	// 确保 URL 格式正确
	apiURL := strings.TrimSuffix(cfg.BaseURL, "/") + "/v1/images/edits"

	req, err := http.NewRequest("POST", apiURL, body)
	if err != nil {
		return nil, "", err
	}

	return req, writer.FormDataContentType(), nil
}

// parseOpenAICompatResponse 解析OpenAI兼容API响应.
func parseOpenAICompatResponse(resp *http.Response, providerName string) (string, error) {
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("读取响应失败")
	}

	if resp.StatusCode != http.StatusOK {
		return "", errors.New(providerName + " API返回错误: " + string(respBody))
	}

	var editResp OpenAIImageEditResponse
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

// decodeBase64Image 解码 base64 图片数据.
func decodeBase64Image(dataURL string) ([]byte, error) {
	// 移除 data URL 前缀
	parts := strings.SplitN(dataURL, ",", 2)
	if len(parts) != 2 {
		return nil, errors.New("无效的图片数据格式")
	}

	return base64.StdEncoding.DecodeString(parts[1])
}
