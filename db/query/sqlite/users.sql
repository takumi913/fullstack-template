-- name: CreateUser :exec
INSERT INTO users (id, username, email, password_hash, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?);
-- name: GetUserByID :one
SELECT * FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1;
-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1;
-- name: GetUserByUsername :one
SELECT * FROM users WHERE username = ? AND deleted_at IS NULL LIMIT 1;
-- name: UpdateUserProfile :execrows
UPDATE users SET username = ?, email = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL;
-- name: UpdateUserPassword :execrows
UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL;
-- name: CountUsers :one
SELECT COUNT(*) FROM users
WHERE deleted_at IS NULL
  AND (instr(lower(username), lower(CAST(sqlc.arg(search) AS TEXT))) > 0
       OR instr(lower(email), lower(CAST(sqlc.arg(search) AS TEXT))) > 0);
-- name: ListUsers :many
SELECT * FROM users
WHERE deleted_at IS NULL
  AND (instr(lower(username), lower(CAST(sqlc.arg(search) AS TEXT))) > 0
       OR instr(lower(email), lower(CAST(sqlc.arg(search) AS TEXT))) > 0)
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(page_limit) OFFSET sqlc.arg(page_offset);
-- name: UpdateUserStatus :execrows
UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL AND is_admin = FALSE;
-- name: SetUserAdmin :execrows
UPDATE users SET is_admin = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active' AND deleted_at IS NULL;
