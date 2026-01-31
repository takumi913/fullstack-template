// Package repo 数据访问层
package repo

import (
	"go-react-template/pkg/database"
	"go-react-template/pkg/model"

	"gorm.io/gorm"
)

// AITaskRepo AI任务数据访问接口.
type AITaskRepo interface {
	Create(task *model.AITask) error
	GetByID(id string) (*model.AITask, error)
	Update(task *model.AITask) error
	GetByUserID(userID string, page, pageSize int, taskType model.AITaskType, status model.AITaskStatus) ([]model.AITask, int64, error)
}

// aiTaskRepo AI任务数据访问实现.
type aiTaskRepo struct {
	db *gorm.DB
}

// NewAITaskRepo 创建AI任务数据访问实例.
func NewAITaskRepo() AITaskRepo {
	return &aiTaskRepo{
		db: database.DB,
	}
}

// Create 创建AI任务.
func (r *aiTaskRepo) Create(task *model.AITask) error {
	return r.db.Create(task).Error
}

// GetByID 根据ID获取AI任务.
func (r *aiTaskRepo) GetByID(id string) (*model.AITask, error) {
	var task model.AITask

	if err := r.db.Where("id = ?", id).First(&task).Error; err != nil {
		return nil, err
	}

	return &task, nil
}

// Update 更新AI任务.
func (r *aiTaskRepo) Update(task *model.AITask) error {
	return r.db.Save(task).Error
}

// GetByUserID 获取用户的AI任务列表.
func (r *aiTaskRepo) GetByUserID(userID string, page, pageSize int, taskType model.AITaskType, status model.AITaskStatus) ([]model.AITask, int64, error) {
	var (
		tasks []model.AITask
		total int64
	)

	query := r.db.Model(&model.AITask{}).Where("user_id = ?", userID)

	if taskType != "" {
		query = query.Where("type = ?", taskType)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize

	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}
