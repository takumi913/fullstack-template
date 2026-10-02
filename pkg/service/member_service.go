package service

import (
	"context"
	"errors"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"strings"

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
		return nil, model.ErrRoleInvalid
	}
	if actor.Role == model.TenantRoleAdmin && req.Role == model.TenantRoleOwner {
		return nil, model.ErrAdminAddOwner
	}
	u, e := s.store.GetUserByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email)))
	if e != nil {
		return nil, model.ErrUserMissing
	}
	m := &model.TenantMember{ID: uuid.NewString(), TenantID: tenantID, UserID: u.ID, Role: req.Role}
	if e = s.store.CreateMember(ctx, m); e != nil {
		return nil, e
	}
	return m, nil
}
func (s *MemberService) UpdateRole(ctx context.Context, tenantID, userID string, actor model.TenantMember, role model.TenantRole) error {
	if !validRole(role) {
		return model.ErrRoleInvalid
	}
	target, e := s.store.GetMember(ctx, tenantID, userID)
	if e != nil {
		return e
	}
	if actor.Role == model.TenantRoleAdmin && (target.Role == model.TenantRoleOwner || role == model.TenantRoleOwner) {
		return model.ErrAdminManageOwner
	}
	if target.Role == model.TenantRoleOwner && role != model.TenantRoleOwner {
		owners, e := s.store.CountOwners(ctx, tenantID)
		if e != nil {
			return e
		}
		if owners <= 1 {
			return model.ErrLastOwner
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
		return model.ErrAdminRemoveOwner
	}
	// 「至少保留一个 owner」的判断和删除必须原子完成，否则两个并发删除
	// 会各自读到 owners=2 并双双放行，租户从此没有任何 owner。
	if e = s.store.DeleteMemberKeepingOwner(ctx, tenantID, userID); e != nil {
		if errors.Is(e, repo.ErrConflict) {
			return model.ErrLastOwner
		}
		return e
	}
	return nil
}
