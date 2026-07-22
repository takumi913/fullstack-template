-- name: CreateTenantMember :exec
INSERT INTO tenant_members (id, tenant_id, user_id, role) VALUES (?, ?, ?, ?);
-- name: GetTenantMember :one
SELECT * FROM tenant_members WHERE tenant_id = ? AND user_id = ? LIMIT 1;
-- name: ListTenantMembers :many
SELECT tm.id, tm.tenant_id, tm.user_id, tm.role, tm.created_at, tm.updated_at, u.username, u.email, u.avatar_url FROM tenant_members tm JOIN users u ON u.id = tm.user_id WHERE tm.tenant_id = ? AND u.deleted_at IS NULL ORDER BY tm.created_at ASC;
-- name: UpdateTenantMemberRole :execrows
UPDATE tenant_members SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND user_id = ?;
-- name: DeleteTenantMember :execrows
DELETE FROM tenant_members WHERE tenant_id = ? AND user_id = ?;
-- name: CountTenantOwners :one
SELECT COUNT(*) FROM tenant_members WHERE tenant_id = ? AND role = 'owner';
