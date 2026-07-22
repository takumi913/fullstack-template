package model

import "time"

type Tenant struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Slug      string     `json:"slug"`
	CreatedBy string     `json:"created_by"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"-"`
}
type CreateTenantRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}
type UpdateTenantRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}
