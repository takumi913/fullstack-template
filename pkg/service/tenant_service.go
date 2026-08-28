package service

import (
	"context"
	"errors"
	"fmt"
	"fullstack-template/pkg/model"
	"fullstack-template/pkg/repo"
	"strings"

	"github.com/google/uuid"
)

type TenantService struct{ store *repo.Store }

func NewTenantService(s *repo.Store) *TenantService { return &TenantService{store: s} }
func (s *TenantService) List(ctx context.Context, userID string) ([]model.Tenant, error) {
	return s.store.ListTenants(ctx, userID)
}
func (s *TenantService) Get(ctx context.Context, id string) (*model.Tenant, error) {
	return s.store.GetTenantByID(ctx, id)
}
func (s *TenantService) Create(ctx context.Context, userID string, req model.CreateTenantRequest) (*model.Tenant, error) {
	req.Name = strings.TrimSpace(req.Name)
	req.Slug = slugify(req.Slug)
	if err := validateTenantName(req.Name); err != nil {
		return nil, err
	}
	if req.Slug == "" {
		req.Slug = slugify(req.Name) + "-" + uuid.NewString()[:8]
	}
	if len(req.Slug) > maxTenantSlug {
		return nil, fmt.Errorf("标识长度不能超过 %d 个字符", maxTenantSlug)
	}
	t := &model.Tenant{ID: uuid.NewString(), Name: req.Name, Slug: req.Slug, CreatedBy: userID}
	m := &model.TenantMember{ID: uuid.NewString(), TenantID: t.ID, UserID: userID, Role: model.TenantRoleOwner}
	if e := s.store.WithTx(ctx, func(tx *repo.Store) error {
		if e := tx.CreateTenant(ctx, t); e != nil {
			return e
		}
		return tx.CreateMember(ctx, m)
	}); e != nil {
		return nil, e
	}
	return s.store.GetTenantByID(ctx, t.ID)
}
func (s *TenantService) Update(ctx context.Context, id string, req model.UpdateTenantRequest) (*model.Tenant, error) {
	t, e := s.store.GetTenantByID(ctx, id)
	if e != nil {
		return nil, e
	}
	if name := strings.TrimSpace(req.Name); name != "" {
		if err := validateTenantName(name); err != nil {
			return nil, err
		}
		t.Name = name
	}
	if strings.TrimSpace(req.Slug) != "" {
		// 必须校验 slugify 之后的结果：像 "!!!!" 这样的输入会被规整成空串，
		// 直接写库会让该租户的标识变成空字符串，并占用唯一索引。
		slug := slugify(req.Slug)
		if slug == "" {
			return nil, errors.New("标识必须包含字母或数字")
		}
		if len(slug) > maxTenantSlug {
			return nil, fmt.Errorf("标识长度不能超过 %d 个字符", maxTenantSlug)
		}
		t.Slug = slug
	}
	if e = s.store.UpdateTenant(ctx, t); e != nil {
		return nil, e
	}
	return t, nil
}
func (s *TenantService) Delete(ctx context.Context, id string) error {
	return s.store.DeleteTenant(ctx, id)
}
func (s *TenantService) Select(ctx context.Context, sessionID, userID, tenantID string) error {
	if _, e := s.store.GetMember(ctx, tenantID, userID); e != nil {
		return errors.New("您不是该租户成员")
	}
	return s.store.UpdateSessionTenant(ctx, sessionID, &tenantID)
}
