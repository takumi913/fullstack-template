# 后端

## API

资源用复数名词。更新用 `PATCH`，不用 `PUT`。需要登录的路由先挂 `auth.Require`；`/api/v1/admin/*` 再挂 `auth.RequireAdmin`，每次请求从数据库读当前权限。

响应只有这一层结构：

```json
{ "code": 0, "data": {}, "message": "操作成功" }
```

失败时 `code` 非 0，`data` 为 null。5xx 的原始错误只进 slog，客户端看到统一的内部错误文案。日志带 `request_id`，与访问日志是同一个 id。

登录、注册挂 IP 限流。Echo 的限流速率单位是次/秒；这套模板用 `0.2` 和 burst `10`。限流响应也走同一套 `code` / `message`，并按 `Accept-Language` 选中英文。

业务文案放在 `pkg/model/messages.go`。service 返回业务错误，HTTP 边界再按语言展示。

## sqlc

`sqlc.yaml` 有 sqlite 和 postgresql 两段。查询名必须一致，占位符分别是 `?` 和 `$1`。生成目录是 `db/generated/sqlite` 与 `db/generated/postgres`，包名不同，由 `pkg/repo` 按 `DB_DRIVER` 切换。

迁移两边各放同版本号文件，例如 `db/migrations/sqlite/000004_add_projects.up.sql` 和 postgres 的同名版本。启动时按版本执行未应用的迁移。新增影响查询的表或列时，把迁移加进 `sqlc.yaml` 的 schema。

每条查询都要写 `deleted_at IS NULL`。软删除不是框架行为。不要在循环里补查询；关联数据在 SQL 里 JOIN。

SQLite 连接池限制为单连接。改完 `db/query/` 后运行 `make sqlc-generate`，并让 CI 跑 `make sqlc-verify`。

## 会话与账号

- Cookie 名 `session_token`，`HttpOnly`，`SameSite=Lax`，`Secure` 由 `COOKIE_SECURE` 决定。
- 数据库只存 token 的 SHA-256。过期由 `SESSION_EXPIRE_HOUR` 控制，默认 24，没有刷新接口。
- 密码用 bcrypt 默认成本。登录时邮箱不存在也要做一次比较，避免用耗时判断账号是否存在。bcrypt 只处理前 72 字节，更长要在 service 拒绝。
- 注册默认普通用户。`grant-admin --user-id` 只给已存在且启用的指定用户授权，不按邮箱或注册顺序猜测。
- 禁用用户必须在同一事务里改状态并删除该用户全部会话。管理员账号不能从网页启停。
- 注册和自助资料 DTO 不接受 `is_admin`。

请求体限制 64KiB。访问日志用 `RequestLoggerWithConfig` 转到 slog，字段用 `method`、`uri`、`status`、`latency_ms`、`request_id`。收到 SIGINT/SIGTERM 后先停 HTTP，再关数据库。定期删除过期会话。
