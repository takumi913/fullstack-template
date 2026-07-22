-- name: CreateTenantMember :exec
INSERT INTO tenant_members (id, tenant_id, user_id, role) VALUES ($1, $2, $3, $4);
-- name: GetTenantMember :one
SELECT * FROM tenant_members WHERE tenant_id = $1 AND user_id = $2 LIMIT 1;
-- name: ListTenantMembers :many
SELECT tm.id, tm.tenant_id, tm.user_id, tm.role, tm.created_at, tm.updated_at, u.username, u.email, u.avatar_url FROM tenant_members tm JOIN users u ON u.id = tm.user_id WHERE tm.tenant_id = $1 AND u.deleted_at IS NULL ORDER BY tm.created_at ASC;
-- name: UpdateTenantMemberRole :execrows
UPDATE tenant_members SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $2 AND user_id = $3;
-- name: DeleteTenantMember :execrows
DELETE FROM tenant_members WHERE tenant_id = $1 AND user_id = $2;
-- name: CountTenantOwners :one
SELECT COUNT(*) FROM tenant_members WHERE tenant_id = $1 AND role = 'owner';
