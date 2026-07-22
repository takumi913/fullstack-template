package model

import "time"

type TenantMember struct {
	ID        string     `json:"id"`
	TenantID  string     `json:"tenant_id"`
	UserID    string     `json:"user_id"`
	Role      TenantRole `json:"role"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
type TenantMemberDetail struct {
	TenantMember
	Username  string `json:"username"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}
type AddMemberRequest struct {
	Email string     `json:"email"`
	Role  TenantRole `json:"role"`
}
type UpdateMemberRoleRequest struct {
	Role TenantRole `json:"role"`
}
