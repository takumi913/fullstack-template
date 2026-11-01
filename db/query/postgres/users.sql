-- name: CreateUser :exec
INSERT INTO users (id, username, email, password_hash, avatar_url, status) VALUES ($1, $2, $3, $4, $5, $6);
-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1;
-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1;
-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL LIMIT 1;
-- name: UpdateUserProfile :execrows
UPDATE users SET username = $1, email = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND deleted_at IS NULL;
-- name: UpdateUserPassword :execrows
UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND deleted_at IS NULL;
-- name: CountUsers :one
SELECT COUNT(*) FROM users
WHERE deleted_at IS NULL
  AND (strpos(lower(username), lower(sqlc.arg(search)::text)) > 0
       OR strpos(lower(email), lower(sqlc.arg(search)::text)) > 0);
-- name: ListUsers :many
SELECT * FROM users
WHERE deleted_at IS NULL
  AND (strpos(lower(username), lower(sqlc.arg(search)::text)) > 0
       OR strpos(lower(email), lower(sqlc.arg(search)::text)) > 0)
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(page_limit)::bigint OFFSET sqlc.arg(page_offset)::bigint;
-- name: UpdateUserStatus :execrows
UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND deleted_at IS NULL AND is_admin = FALSE;
-- name: SetUserAdmin :execrows
UPDATE users SET is_admin = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'active' AND deleted_at IS NULL;
