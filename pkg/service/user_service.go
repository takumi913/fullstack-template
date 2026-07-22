package service

import (
	"context"
	"errors"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct{ store *repo.Store }

func NewUserService(s *repo.Store) *UserService { return &UserService{store: s} }
func (s *UserService) Get(ctx context.Context, id string) (*model.UserResponse, error) {
	u, e := s.store.GetUserByID(ctx, id)
	if e != nil {
		return nil, e
	}
	r := u.ToResponse()
	return &r, nil
}
func (s *UserService) Update(ctx context.Context, id string, req model.UpdateProfileRequest) (*model.UserResponse, error) {
	u, e := s.store.GetUserByID(ctx, id)
	if e != nil {
		return nil, e
	}
	if strings.TrimSpace(req.Username) != "" {
		u.Username = strings.TrimSpace(req.Username)
	}
	if strings.TrimSpace(req.Email) != "" {
		u.Email = strings.ToLower(strings.TrimSpace(req.Email))
	}
	u.AvatarURL = strings.TrimSpace(req.AvatarURL)
	if e = s.store.UpdateUserProfile(ctx, u); e != nil {
		if errors.Is(e, repo.ErrConflict) {
			return nil, errors.New("邮箱或用户名已被使用")
		}
		return nil, e
	}
	r := u.ToResponse()
	return &r, nil
}
func (s *UserService) ChangePassword(ctx context.Context, id string, req model.ChangePasswordRequest) error {
	if len(req.NewPassword) < 6 {
		return errors.New("新密码长度不能少于6个字符")
	}
	u, e := s.store.GetUserByID(ctx, id)
	if e != nil {
		return e
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.OldPassword)) != nil {
		return errors.New("原密码错误")
	}
	h, e := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if e != nil {
		return e
	}
	if e = s.store.UpdateUserPassword(ctx, id, string(h)); e != nil {
		return e
	}
	return s.store.DeleteUserSessions(ctx, id)
}
