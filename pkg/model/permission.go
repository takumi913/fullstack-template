package model

type TenantRole string

const (
	TenantRoleOwner  TenantRole = "owner"
	TenantRoleAdmin  TenantRole = "admin"
	TenantRoleMember TenantRole = "member"
)

type Permission string

const (
	PermissionTenantRead   Permission = "tenant:read"
	PermissionTenantUpdate Permission = "tenant:update"
	PermissionTenantDelete Permission = "tenant:delete"
	PermissionMemberRead   Permission = "member:read"
	PermissionMemberCreate Permission = "member:create"
	PermissionMemberUpdate Permission = "member:update"
	PermissionMemberDelete Permission = "member:delete"
)

var RolePermissions = map[TenantRole]map[Permission]bool{TenantRoleOwner: {PermissionTenantRead: true, PermissionTenantUpdate: true, PermissionTenantDelete: true, PermissionMemberRead: true, PermissionMemberCreate: true, PermissionMemberUpdate: true, PermissionMemberDelete: true}, TenantRoleAdmin: {PermissionTenantRead: true, PermissionTenantUpdate: true, PermissionMemberRead: true, PermissionMemberCreate: true, PermissionMemberUpdate: true, PermissionMemberDelete: true}, TenantRoleMember: {PermissionTenantRead: true, PermissionMemberRead: true}}

func HasPermission(role TenantRole, permission Permission) bool {
	return RolePermissions[role][permission]
}
