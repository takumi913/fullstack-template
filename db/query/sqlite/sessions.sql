-- name: CreateSession :execrows
INSERT INTO sessions (id, user_id, token_hash, expires_at)
SELECT sqlc.arg(id), users.id, sqlc.arg(token_hash), sqlc.arg(expires_at)
FROM users
WHERE users.id = sqlc.arg(user_id) AND status = 'active' AND deleted_at IS NULL;
-- name: GetSessionByTokenHash :one
SELECT * FROM sessions WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1;
-- name: DeleteSession :execrows
DELETE FROM sessions WHERE id = ?;
-- name: DeleteSessionsByUserID :exec
DELETE FROM sessions WHERE user_id = ?;
-- name: DeleteExpiredSessions :exec
DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP;
