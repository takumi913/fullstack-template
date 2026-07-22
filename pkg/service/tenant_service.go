package service

import (
	"context"
	"errors"
	"go-react-template/pkg/model"
	"go-react-template/pkg/repo"
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
	if req.Name == "" {
		return nil, errors.New("租户名称不能为空")
	}
	if req.Slug == "" {
		req.Slug = slugify(req.Name) + "-" + uuid.NewString()[:8]
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
	if strings.TrimSpace(req.Name) != "" {
		t.Name = strings.TrimSpace(req.Name)
	}
	if strings.TrimSpace(req.Slug) != "" {
		t.Slug = slugify(req.Slug)
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
