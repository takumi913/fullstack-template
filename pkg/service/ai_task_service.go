// Package service 业务逻辑层
package service

import (
	"errors"

	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
)

// AITaskService AI任务服务接口.
type AITaskService interface {
	GetTask(taskID string) (*model.AITaskResponse, error)
	GetUserTasks(userID string, req *model.AITaskListRequest) ([]model.AITaskResponse, int64, error)
}

// aiTaskService AI任务服务实现.
type aiTaskService struct {
	taskRepo repo.AITaskRepo
}

// NewAITaskService 创建AI任务服务实例.
func NewAITaskService(taskRepo repo.AITaskRepo) AITaskService {
	return &aiTaskService{
		taskRepo: taskRepo,
	}
}

// GetTask 获取任务详情.
func (s *aiTaskService) GetTask(taskID string) (*model.AITaskResponse, error) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return nil, errors.New("任务不存在")
	}

	resp := task.ToResponse()

	return &resp, nil
}

// GetUserTasks 获取用户任务列表.
func (s *aiTaskService) GetUserTasks(userID string, req *model.AITaskListRequest) ([]model.AITaskResponse, int64, error) {
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
