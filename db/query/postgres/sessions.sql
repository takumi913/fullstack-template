-- name: CreateSession :execrows
INSERT INTO sessions (id, user_id, token_hash, expires_at)
SELECT sqlc.arg(id)::text, users.id, sqlc.arg(token_hash)::text, sqlc.arg(expires_at)::timestamptz
FROM users
WHERE users.id = sqlc.arg(user_id) AND status = 'active' AND deleted_at IS NULL
-- Disabling an account must wait for any in-flight session insert before revoking its sessions.
FOR UPDATE;
-- name: GetSessionByTokenHash :one
SELECT * FROM sessions WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP LIMIT 1;
-- name: DeleteSession :execrows
DELETE FROM sessions WHERE id = $1;
-- name: DeleteSessionsByUserID :exec
DELETE FROM sessions WHERE user_id = $1;
-- name: DeleteExpiredSessions :exec
DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP;
