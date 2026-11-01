-- 重建 sessions，去掉旧库里的 active_tenant_id。
-- 新安装的 000001 已经没有该列，按列名拷贝仍然成立。
CREATE TABLE sessions_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sessions_new (id, user_id, token_hash, expires_at, created_at, updated_at)
SELECT id, user_id, token_hash, expires_at, created_at, updated_at FROM sessions;

DROP TABLE sessions;

ALTER TABLE sessions_new RENAME TO sessions;

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

DROP TABLE IF EXISTS tenant_members;
DROP TABLE IF EXISTS tenants;
