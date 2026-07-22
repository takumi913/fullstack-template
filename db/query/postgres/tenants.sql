-- name: CreateTenant :exec
INSERT INTO tenants (id, name, slug, created_by) VALUES ($1, $2, $3, $4);
-- name: GetTenantByID :one
SELECT * FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1;
-- name: GetTenantBySlug :one
SELECT * FROM tenants WHERE slug = $1 AND deleted_at IS NULL LIMIT 1;
-- name: ListTenantsByUserID :many
SELECT t.* FROM tenants t JOIN tenant_members tm ON tm.tenant_id = t.id WHERE tm.user_id = $1 AND t.deleted_at IS NULL ORDER BY t.created_at ASC;
-- name: UpdateTenant :execrows
UPDATE tenants SET name = $1, slug = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND deleted_at IS NULL;
-- name: SoftDeleteTenant :execrows
UPDATE tenants SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL;
