package service

import (
	"context"
	"errors"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"

	"github.com/google/uuid"
)

type MemberService struct{ store *repo.Store }

func NewMemberService(s *repo.Store) *MemberService { return &MemberService{store: s} }
func validRole(r model.TenantRole) bool {
	return r == model.TenantRoleOwner || r == model.TenantRoleAdmin || r == model.TenantRoleMember
}
func (s *MemberService) List(ctx context.Context, tenantID string) ([]model.TenantMemberDetail, error) {
	return s.store.ListMembers(ctx, tenantID)
}
func (s *MemberService) Add(ctx context.Context, tenantID string, actor model.TenantMember, req model.AddMemberRequest) (*model.TenantMember, error) {
	if !validRole(req.Role) {
		return nil, errors.New("无效角色")
	}
	if actor.Role == model.TenantRoleAdmin && req.Role == model.TenantRoleOwner {
		return nil, errors.New("管理员不能添加所有者")
	}
	u, e := s.store.GetUserByEmail(ctx, req.Email)
	if e != nil {
		return nil, errors.New("用户不存在，请先注册")
	}
	m := &model.TenantMember{ID: uuid.NewString(), TenantID: tenantID, UserID: u.ID, Role: req.Role}
	if e = s.store.CreateMember(ctx, m); e != nil {
		return nil, e
	}
	return m, nil
}
func (s *MemberService) UpdateRole(ctx context.Context, tenantID, userID string, actor model.TenantMember, role model.TenantRole) error {
	if !validRole(role) {
		return errors.New("无效角色")
	}
	target, e := s.store.GetMember(ctx, tenantID, userID)
	if e != nil {
		return e
	}
	if actor.Role == model.TenantRoleAdmin && (target.Role == model.TenantRoleOwner || role == model.TenantRoleOwner) {
		return errors.New("管理员不能管理所有者")
	}
	if target.Role == model.TenantRoleOwner && role != model.TenantRoleOwner {
		owners, e := s.store.CountOwners(ctx, tenantID)
		if e != nil {
			return e
		}
		if owners <= 1 {
			return errors.New("租户至少需要一个所有者")
		}
	}
	return s.store.UpdateMemberRole(ctx, tenantID, userID, role)
}
func (s *MemberService) Delete(ctx context.Context, tenantID, userID string, actor model.TenantMember) error {
	target, e := s.store.GetMember(ctx, tenantID, userID)
	if e != nil {
		return e
	}
	if actor.Role == model.TenantRoleAdmin && target.Role == model.TenantRoleOwner {
		return errors.New("管理员不能删除所有者")
	}
	if target.Role == model.TenantRoleOwner {
		owners, e := s.store.CountOwners(ctx, tenantID)
		if e != nil {
			return e
		}
		if owners <= 1 {
			return errors.New("租户至少需要一个所有者")
		}
	}
	return s.store.DeleteMember(ctx, tenantID, userID)
}
