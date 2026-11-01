-- 已有库在 000001 应用后仍保留工作区表和会话里的当前工作区列。
-- 新安装的 000001 已不含这些对象，因此使用 IF EXISTS。
ALTER TABLE sessions DROP COLUMN IF EXISTS active_tenant_id;
DROP TABLE IF EXISTS tenant_members;
DROP TABLE IF EXISTS tenants;
