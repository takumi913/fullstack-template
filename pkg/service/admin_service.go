// Package service 业务逻辑层
package service

import (
	"errors"

	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"github.com/shopspring/decimal"
)

// DashboardStats 仪表板统计数据.
type DashboardStats struct {
	TotalUsers            int64           `json:"total_users"`
	RegisteredPayingUsers int64           `json:"registered_paying_users"`
	GuestPayingUsers      int64           `json:"guest_paying_users"`
	TotalOrders           int64           `json:"total_orders"`
	TotalOrderAmount      decimal.Decimal `json:"total_order_amount"`
	TodayNewUsers         int64           `json:"today_new_users"`
	TodayRevenue          decimal.Decimal `json:"today_revenue"`
}

// AdminService 管理员业务逻辑接口.
type AdminService interface {
	// 统计
	GetDashboardStats() (*DashboardStats, error)
	GetUserGrowth(days int) ([]repo.DailyStats, error)
	GetRevenueGrowth(days int) ([]repo.DailyStats, error)

	// Provider CRUD
	CreateProvider(req *model.AIProviderCreateRequest) (*model.AIProviderResponse, error)
	GetProvider(id string) (*model.AIProviderResponse, error)
	ListProviders() ([]model.AIProviderResponse, error)
	UpdateProvider(id string, req *model.AIProviderUpdateRequest) (*model.AIProviderResponse, error)
	DeleteProvider(id string) error
	ToggleProvider(id string) (*model.AIProviderResponse, error)

	// Model CRUD
	CreateModel(req *model.AIModelCreateRequest) (*model.AIModelResponse, error)
	GetModel(id string) (*model.AIModelResponse, error)
	ListModels() ([]model.AIModelResponse, error)
	UpdateModel(id string, req *model.AIModelUpdateRequest) (*model.AIModelResponse, error)
	DeleteModel(id string) error
	ToggleModel(id string) (*model.AIModelResponse, error)

	// 公开 API
	GetEnabledModelsByType(providerType model.ProviderType) ([]model.PublicAIModelResponse, error)
}

// adminService 管理员业务逻辑实现.
type adminService struct {
	adminRepo      repo.AdminRepo
	aiProviderRepo repo.AIProviderRepo
}

// NewAdminService 创建管理员业务逻辑实例.
func NewAdminService(adminRepo repo.AdminRepo, aiProviderRepo repo.AIProviderRepo) AdminService {
	return &adminService{
		adminRepo:      adminRepo,
		aiProviderRepo: aiProviderRepo,
	}
}

// GetDashboardStats 获取仪表板统计数据.
func (s *adminService) GetDashboardStats() (*DashboardStats, error) {
	stats := &DashboardStats{}

	totalUsers, err := s.adminRepo.GetTotalUsers()
	if err != nil {
		return nil, err
	}

	stats.TotalUsers = totalUsers

	todayNewUsers, err := s.adminRepo.GetTodayNewUsers()
	if err != nil {
		return nil, err
	}

	stats.TodayNewUsers = todayNewUsers

	registered, guest, err := s.adminRepo.GetPayingUsers()
	if err != nil {
		return nil, err
	}

	stats.RegisteredPayingUsers = registered
	stats.GuestPayingUsers = guest

	orderCount, orderAmount, err := s.adminRepo.GetOrderStats()
	if err != nil {
		return nil, err
	}

	stats.TotalOrders = orderCount
	stats.TotalOrderAmount = orderAmount

	todayRevenue, err := s.adminRepo.GetTodayRevenue()
	if err != nil {
		return nil, err
	}

	stats.TodayRevenue = todayRevenue

	return stats, nil
}

// GetUserGrowth 获取用户增长趋势.
func (s *adminService) GetUserGrowth(days int) ([]repo.DailyStats, error) {
	if days <= 0 {
		days = 30
	}

	return s.adminRepo.GetUserGrowth(days)
}

// GetRevenueGrowth 获取收入增长趋势.
func (s *adminService) GetRevenueGrowth(days int) ([]repo.DailyStats, error) {
	if days <= 0 {
		days = 30
	}

	return s.adminRepo.GetRevenueGrowth(days)
}

// CreateProvider 创建 Provider.
func (s *adminService) CreateProvider(req *model.AIProviderCreateRequest) (*model.AIProviderResponse, error) {
	if _, err := s.aiProviderRepo.GetProviderByName(req.Name); err == nil {
		return nil, errors.New("Provider名称已存在")
	}

	provider := &model.AIProvider{
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Type:        req.Type,
		BaseURL:     req.BaseURL,
		APIKey:      req.APIKey,
		IsEnabled:   req.IsEnabled,
		Priority:    req.Priority,
		Config:      req.Config,
	}

	if err := s.aiProviderRepo.CreateProvider(provider); err != nil {
		return nil, err
	}

	resp := provider.ToResponse()

	return &resp, nil
}

// GetProvider 获取 Provider.
func (s *adminService) GetProvider(id string) (*model.AIProviderResponse, error) {
	provider, err := s.aiProviderRepo.GetProviderByID(id)
	if err != nil {
		return nil, err
	}

	resp := provider.ToResponse()

	return &resp, nil
}

// ListProviders 获取所有 Provider.
func (s *adminService) ListProviders() ([]model.AIProviderResponse, error) {
	providers, err := s.aiProviderRepo.GetAllProviders()
	if err != nil {
		return nil, err
	}

	responses := make([]model.AIProviderResponse, len(providers))
	for i, p := range providers {
		responses[i] = p.ToResponse()
	}

	return responses, nil
}

// UpdateProvider 更新 Provider.
func (s *adminService) UpdateProvider(id string, req *model.AIProviderUpdateRequest) (*model.AIProviderResponse, error) {
	provider, err := s.aiProviderRepo.GetProviderByID(id)
	if err != nil {
		return nil, err
	}

	if req.DisplayName != nil {
		provider.DisplayName = *req.DisplayName
	}

	if req.Type != nil {
		provider.Type = *req.Type
	}

	if req.BaseURL != nil {
		provider.BaseURL = *req.BaseURL
	}

	if req.APIKey != nil {
		provider.APIKey = *req.APIKey
	}

	if req.IsEnabled != nil {
		provider.IsEnabled = *req.IsEnabled
	}

	if req.Priority != nil {
		provider.Priority = *req.Priority
	}

	if req.Config != nil {
		provider.Config = *req.Config
	}

	if err := s.aiProviderRepo.UpdateProvider(provider); err != nil {
		return nil, err
	}

	resp := provider.ToResponse()

	return &resp, nil
}

// DeleteProvider 删除 Provider.
func (s *adminService) DeleteProvider(id string) error {
	if _, err := s.aiProviderRepo.GetProviderByID(id); err != nil {
		return err
	}

	models, err := s.aiProviderRepo.GetModelsByProviderID(id)
	if err != nil {
		return err
	}

	if len(models) > 0 {
		return errors.New("请先删除该Provider下的所有Model")
	}

	return s.aiProviderRepo.DeleteProvider(id)
}

// ToggleProvider 切换 Provider 启用状态.
func (s *adminService) ToggleProvider(id string) (*model.AIProviderResponse, error) {
	provider, err := s.aiProviderRepo.GetProviderByID(id)
	if err != nil {
		return nil, err
	}

	provider.IsEnabled = !provider.IsEnabled

	if err := s.aiProviderRepo.UpdateProvider(provider); err != nil {
		return nil, err
	}

	resp := provider.ToResponse()

	return &resp, nil
}

// CreateModel 创建 Model.
func (s *adminService) CreateModel(req *model.AIModelCreateRequest) (*model.AIModelResponse, error) {
	provider, err := s.aiProviderRepo.GetProviderByID(req.ProviderID)
	if err != nil {
		return nil, errors.New("Provider不存在")
	}

	if req.IsDefault {
		if err := s.aiProviderRepo.ClearDefaultByProviderType(provider.Type); err != nil {
			return nil, err
		}
	}

	m := &model.AIModel{
		ProviderID:    req.ProviderID,
		Name:          req.Name,
		DisplayName:   req.DisplayName,
		CreditsPerUse: req.CreditsPerUse,
		IsEnabled:     req.IsEnabled,
		IsDefault:     req.IsDefault,
		Config:        req.Config,
	}

	if err := s.aiProviderRepo.CreateModel(m); err != nil {
		return nil, err
	}

	m, err = s.aiProviderRepo.GetModelByID(m.ID)
	if err != nil {
		return nil, err
	}

	resp := m.ToResponse()

	return &resp, nil
}

// GetModel 获取 Model.
func (s *adminService) GetModel(id string) (*model.AIModelResponse, error) {
	m, err := s.aiProviderRepo.GetModelByID(id)
	if err != nil {
		return nil, err
	}

	resp := m.ToResponse()

	return &resp, nil
}

// ListModels 获取所有 Model.
func (s *adminService) ListModels() ([]model.AIModelResponse, error) {
	models, err := s.aiProviderRepo.GetAllModels()
	if err != nil {
		return nil, err
	}

	responses := make([]model.AIModelResponse, len(models))
	for i, m := range models {
		responses[i] = m.ToResponse()
	}

	return responses, nil
}

// UpdateModel 更新 Model.
//
//nolint:gocyclo // PATCH 更新需要检查多个可选字段
func (s *adminService) UpdateModel(id string, req *model.AIModelUpdateRequest) (*model.AIModelResponse, error) {
	m, err := s.aiProviderRepo.GetModelByID(id)
	if err != nil {
		return nil, err
	}

	if req.ProviderID != nil {
		if _, err := s.aiProviderRepo.GetProviderByID(*req.ProviderID); err != nil {
			return nil, errors.New("Provider不存在")
		}

		m.ProviderID = *req.ProviderID
	}

	if req.Name != nil {
		m.Name = *req.Name
	}

	if req.DisplayName != nil {
		m.DisplayName = *req.DisplayName
	}

	if req.CreditsPerUse != nil {
		m.CreditsPerUse = *req.CreditsPerUse
	}

	if req.IsEnabled != nil {
		m.IsEnabled = *req.IsEnabled
	}

	if req.IsDefault != nil {
		if *req.IsDefault && !m.IsDefault {
			provider, providerErr := s.aiProviderRepo.GetProviderByID(m.ProviderID)
			if providerErr == nil && provider != nil {
				if err := s.aiProviderRepo.ClearDefaultByProviderType(provider.Type); err != nil {
					return nil, err
				}
			}
		}

		m.IsDefault = *req.IsDefault
	}

	if req.Config != nil {
		m.Config = *req.Config
	}

	if err := s.aiProviderRepo.UpdateModel(m); err != nil {
		return nil, err
	}

	m, err = s.aiProviderRepo.GetModelByID(m.ID)
	if err != nil {
		return nil, err
	}

	resp := m.ToResponse()

	return &resp, nil
}

// DeleteModel 删除 Model.
func (s *adminService) DeleteModel(id string) error {
	if _, err := s.aiProviderRepo.GetModelByID(id); err != nil {
		return err
	}

	return s.aiProviderRepo.DeleteModel(id)
}

// ToggleModel 切换 Model 启用状态.
func (s *adminService) ToggleModel(id string) (*model.AIModelResponse, error) {
	m, err := s.aiProviderRepo.GetModelByID(id)
	if err != nil {
		return nil, err
	}

	m.IsEnabled = !m.IsEnabled

	if err := s.aiProviderRepo.UpdateModel(m); err != nil {
		return nil, err
	}

	m, err = s.aiProviderRepo.GetModelByID(m.ID)
	if err != nil {
		return nil, err
	}

	resp := m.ToResponse()

	return &resp, nil
}

// GetEnabledModelsByType 获取指定类型的启用模型（公开 API）.
func (s *adminService) GetEnabledModelsByType(providerType model.ProviderType) ([]model.PublicAIModelResponse, error) {
	models, err := s.aiProviderRepo.GetEnabledModelsByType(providerType)
	if err != nil {
		return nil, err
	}

	responses := make([]model.PublicAIModelResponse, len(models))
	for i, m := range models {
		responses[i] = m.ToPublicResponse()
	}

	return responses, nil
}
