# Docker 部署

默认启动 SQLite：

```bash
docker compose up --build
```

启动附带的 PostgreSQL：

```bash
docker compose --profile postgres up -d postgres
```

然后为应用设置 `DB_DRIVER=postgres` 及对应的 `DB_*` 环境变量。数据库 migration 会在应用启动时按当前数据库方言执行。
