package repo

import (
	"context"
	postgresdb "go-react-template/db/generated/postgres"
	sqlitedb "go-react-template/db/generated/sqlite"
	"go-react-template/pkg/model"
)

func (s *Store) CreateTenant(ctx context.Context, t *model.Tenant) error {
	var e error
	if s.driver == "sqlite" {
		e = s.sqlite.CreateTenant(ctx, sqlitedb.CreateTenantParams{ID: t.ID, Name: t.Name, Slug: t.Slug, CreatedBy: t.CreatedBy})
	} else {
		e = s.postgres.CreateTenant(ctx, postgresdb.CreateTenantParams{ID: t.ID, Name: t.Name, Slug: t.Slug, CreatedBy: t.CreatedBy})
	}
	return normalize(e)
}
func mapSTenant(t sqlitedb.Tenant) model.Tenant {
	return model.Tenant{ID: t.ID, Name: t.Name, Slug: t.Slug, CreatedBy: t.CreatedBy, CreatedAt: t.CreatedAt, UpdatedAt: t.UpdatedAt, DeletedAt: timePtr(t.DeletedAt)}
}
func mapPTenant(t postgresdb.Tenant) model.Tenant {
	return model.Tenant{ID: t.ID, Name: t.Name, Slug: t.Slug, CreatedBy: t.CreatedBy, CreatedAt: t.CreatedAt, UpdatedAt: t.UpdatedAt, DeletedAt: timePtr(t.DeletedAt)}
}
func (s *Store) GetTenantByID(ctx context.Context, id string) (*model.Tenant, error) {
	if s.driver == "sqlite" {
		v, e := s.sqlite.GetTenantByID(ctx, id)
		x := mapSTenant(v)
		return &x, normalize(e)
	}
	v, e := s.postgres.GetTenantByID(ctx, id)
	x := mapPTenant(v)
	return &x, normalize(e)
}
func (s *Store) GetTenantBySlug(ctx context.Context, slug string) (*model.Tenant, error) {
	if s.driver == "sqlite" {
		v, e := s.sqlite.GetTenantBySlug(ctx, slug)
		x := mapSTenant(v)
		return &x, normalize(e)
	}
	v, e := s.postgres.GetTenantBySlug(ctx, slug)
	x := mapPTenant(v)
	return &x, normalize(e)
}
func (s *Store) ListTenants(ctx context.Context, userID string) ([]model.Tenant, error) {
	out := []model.Tenant{}
	if s.driver == "sqlite" {
		v, e := s.sqlite.ListTenantsByUserID(ctx, userID)
		if e != nil {
			return nil, e
		}
		for _, x := range v {
			out = append(out, mapSTenant(x))
		}
	} else {
		v, e := s.postgres.ListTenantsByUserID(ctx, userID)
		if e != nil {
			return nil, e
		}
		for _, x := range v {
			out = append(out, mapPTenant(x))
		}
	}
	return out, nil
}
func (s *Store) UpdateTenant(ctx context.Context, t *model.Tenant) error {
	var n int64
	var e error
	if s.driver == "sqlite" {
		n, e = s.sqlite.UpdateTenant(ctx, sqlitedb.UpdateTenantParams{Name: t.Name, Slug: t.Slug, ID: t.ID})
	} else {
		n, e = s.postgres.UpdateTenant(ctx, postgresdb.UpdateTenantParams{Name: t.Name, Slug: t.Slug, ID: t.ID})
	}
	if e != nil {
		return normalize(e)
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
func (s *Store) DeleteTenant(ctx context.Context, id string) error {
	var n int64
	var e error
	if s.driver == "sqlite" {
		n, e = s.sqlite.SoftDeleteTenant(ctx, id)
	} else {
		n, e = s.postgres.SoftDeleteTenant(ctx, id)
	}
	if e != nil {
		return e
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
