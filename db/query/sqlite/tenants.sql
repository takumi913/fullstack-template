-- name: CreateTenant :exec
INSERT INTO tenants (id, name, slug, created_by) VALUES (?, ?, ?, ?);
-- name: GetTenantByID :one
SELECT * FROM tenants WHERE id = ? AND deleted_at IS NULL LIMIT 1;
-- name: GetTenantBySlug :one
SELECT * FROM tenants WHERE slug = ? AND deleted_at IS NULL LIMIT 1;
-- name: ListTenantsByUserID :many
SELECT t.* FROM tenants t JOIN tenant_members tm ON tm.tenant_id = t.id WHERE tm.user_id = ? AND t.deleted_at IS NULL ORDER BY t.created_at ASC;
-- name: UpdateTenant :execrows
UPDATE tenants SET name = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL;
-- name: SoftDeleteTenant :execrows
UPDATE tenants SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL;
