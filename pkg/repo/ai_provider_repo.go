// Package repo 数据访问层
package repo

import (
	"errors"

	"go-react-template/pkg/database"
	"go-react-template/pkg/model"

	"gorm.io/gorm"
)

// AIProviderRepo AI Provider 数据访问接口.
type AIProviderRepo interface {
	// Provider CRUD
	CreateProvider(provider *model.AIProvider) error
	GetProviderByID(id string) (*model.AIProvider, error)
	GetProviderByName(name string) (*model.AIProvider, error)
	GetAllProviders() ([]model.AIProvider, error)
	GetEnabledProviders() ([]model.AIProvider, error)
	UpdateProvider(provider *model.AIProvider) error
	DeleteProvider(id string) error

	// Model CRUD
	CreateModel(m *model.AIModel) error
	GetModelByID(id string) (*model.AIModel, error)
	GetModelsByProviderID(providerID string) ([]model.AIModel, error)
	GetAllModels() ([]model.AIModel, error)
	GetEnabledModelsByType(providerType model.ProviderType) ([]model.AIModel, error)
	UpdateModel(m *model.AIModel) error
	DeleteModel(id string) error
	ClearDefaultByProviderType(providerType model.ProviderType) error
}

// aiProviderRepo AI Provider 数据访问实现.
type aiProviderRepo struct {
	db *gorm.DB
}

// NewAIProviderRepo 创建 AI Provider 数据访问实例.
func NewAIProviderRepo() AIProviderRepo {
	return &aiProviderRepo{
		db: database.GetDB(),
	}
}

// CreateProvider 创建 Provider.
func (r *aiProviderRepo) CreateProvider(provider *model.AIProvider) error {
	return r.db.Create(provider).Error
}

// GetProviderByID 根据ID获取 Provider.
func (r *aiProviderRepo) GetProviderByID(id string) (*model.AIProvider, error) {
	var provider model.AIProvider

	err := r.db.First(&provider, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Provider不存在")
		}

		return nil, err
	}

	return &provider, nil
}

// GetProviderByName 根据名称获取 Provider.
func (r *aiProviderRepo) GetProviderByName(name string) (*model.AIProvider, error) {
	var provider model.AIProvider

	err := r.db.Where("name = ?", name).First(&provider).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Provider不存在")
		}

		return nil, err
	}

	return &provider, nil
}

// GetAllProviders 获取所有 Provider.
func (r *aiProviderRepo) GetAllProviders() ([]model.AIProvider, error) {
	var providers []model.AIProvider

	err := r.db.Order("priority DESC, created_at ASC").Find(&providers).Error

	return providers, err
}

// GetEnabledProviders 获取所有启用的 Provider.
func (r *aiProviderRepo) GetEnabledProviders() ([]model.AIProvider, error) {
	var providers []model.AIProvider

	err := r.db.Where("is_enabled = ?", true).Order("priority DESC, created_at ASC").Find(&providers).Error

	return providers, err
}

// UpdateProvider 更新 Provider.
func (r *aiProviderRepo) UpdateProvider(provider *model.AIProvider) error {
	return r.db.Save(provider).Error
}

// DeleteProvider 删除 Provider.
func (r *aiProviderRepo) DeleteProvider(id string) error {
	return r.db.Delete(&model.AIProvider{}, "id = ?", id).Error
}

// CreateModel 创建 Model.
func (r *aiProviderRepo) CreateModel(m *model.AIModel) error {
	return r.db.Create(m).Error
}

// GetModelByID 根据ID获取 Model.
func (r *aiProviderRepo) GetModelByID(id string) (*model.AIModel, error) {
	var m model.AIModel

	err := r.db.Preload("Provider").First(&m, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Model不存在")
		}

		return nil, err
	}

	return &m, nil
}

// GetModelsByProviderID 根据 Provider ID 获取所有 Model.
func (r *aiProviderRepo) GetModelsByProviderID(providerID string) ([]model.AIModel, error) {
	var models []model.AIModel

	err := r.db.Where("provider_id = ?", providerID).Order("created_at ASC").Find(&models).Error

	return models, err
}

// GetAllModels 获取所有 Model.
func (r *aiProviderRepo) GetAllModels() ([]model.AIModel, error) {
	var models []model.AIModel

	err := r.db.Preload("Provider").Order("created_at ASC").Find(&models).Error

	return models, err
}

// GetEnabledModelsByType 根据 Provider 类型获取所有启用的 Model.
func (r *aiProviderRepo) GetEnabledModelsByType(providerType model.ProviderType) ([]model.AIModel, error) {
	var models []model.AIModel

	err := r.db.
		Joins("JOIN ai_providers ON ai_models.provider_id = ai_providers.id").
		Where("ai_providers.type = ?", providerType).
		Where("ai_providers.is_enabled = ?", true).
		Where("ai_models.is_enabled = ?", true).
		Preload("Provider").
		Order("ai_models.is_default DESC, ai_models.created_at ASC").
		Find(&models).Error

	return models, err
}

// UpdateModel 更新 Model.
func (r *aiProviderRepo) UpdateModel(m *model.AIModel) error {
	return r.db.Save(m).Error
}

// DeleteModel 删除 Model.
func (r *aiProviderRepo) DeleteModel(id string) error {
	return r.db.Delete(&model.AIModel{}, "id = ?", id).Error
}

// ClearDefaultByProviderType 清除指定类型 Provider 下所有 Model 的默认状态.
func (r *aiProviderRepo) ClearDefaultByProviderType(providerType model.ProviderType) error {
	return r.db.Model(&model.AIModel{}).
		Joins("JOIN ai_providers ON ai_models.provider_id = ai_providers.id").
		Where("ai_providers.type = ?", providerType).
		Update("is_default", false).Error
}
