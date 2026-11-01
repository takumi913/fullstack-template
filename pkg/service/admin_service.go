package service

import (
	"context"
	"errors"
	"log/slog"
	"math"
	"strings"

	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
)

// AdminService manages platform accounts after the HTTP administrator guard.
type AdminService struct{ store *repo.Store }

// NewAdminService creates the platform account service.
func NewAdminService(store *repo.Store) *AdminService { return &AdminService{store: store} }

// List searches registered users with bounded pagination.
func (s *AdminService) List(ctx context.Context, req model.ListUsersRequest) (*model.UserListResponse, error) {
	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 20
	}
	if req.Page < 1 || req.PageSize < 1 || req.PageSize > 100 || req.Page > math.MaxInt/req.PageSize {
		return nil, model.ErrPagination
	}
	query := strings.TrimSpace(req.Query)
	total, err := s.store.CountUsers(ctx, query)
	if err != nil {
		return nil, err
	}
	users, err := s.store.ListUsers(ctx, query, req.PageSize, (req.Page-1)*req.PageSize)
	if err != nil {
		return nil, err
	}
	items := make([]model.UserResponse, 0, len(users))
	for _, user := range users {
		items = append(items, user.ToResponse())
	}
	return &model.UserListResponse{Items: items, Pagination: model.Pagination{Page: req.Page, PageSize: req.PageSize, Total: total}}, nil
}

// SetStatus changes a regular account's status and revokes sessions when disabling it.
func (s *AdminService) SetStatus(ctx context.Context, actorID, userID string, req model.UpdateUserStatusRequest) (*model.UserResponse, error) {
	if req.Status != model.UserStatusActive && req.Status != model.UserStatusDisabled {
		return nil, model.ErrUserStatus
	}
	var response model.UserResponse
	err := s.store.WithTx(ctx, func(tx *repo.Store) error {
		user, err := tx.GetUserByID(ctx, userID)
		if err != nil {
			return err
		}
		// Administrator accounts stay under operator control so the web UI cannot close all admin access.
		if user.IsAdmin {
			return model.ErrAdminProtected
		}
		if err := tx.UpdateUserStatus(ctx, userID, req.Status); err != nil {
			return err
		}
		if req.Status == model.UserStatusDisabled {
			if err := tx.DeleteUserSessions(ctx, userID); err != nil {
				return err
			}
		}
		user.Status = req.Status
		response = user.ToResponse()
		return nil
	})
	if errors.Is(err, repo.ErrNotFound) {
		return nil, model.ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	slog.InfoContext(ctx, "管理员更新用户状态", "actor_id", actorID, "user_id", userID, "status", req.Status)
	return &response, nil
}

// Grant grants administrator access to an active registered account from the local operator command.
func (s *AdminService) Grant(ctx context.Context, userID string) error {
	if err := s.store.SetUserAdmin(ctx, userID); err != nil {
		if errors.Is(err, repo.ErrNotFound) {
			return model.ErrActiveUserMissing
		}
		return err
	}
	slog.InfoContext(ctx, "已授予平台管理员权限", "user_id", userID)
	return nil
}
