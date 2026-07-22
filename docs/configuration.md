# 配置

项目通过环境变量配置，示例见根目录 `.env.example`。

## SQLite

```env
DB_DRIVER=sqlite
DB_PATH=app.db
```

## PostgreSQL

```env
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=fullstack_template
DB_SSLMODE=disable
```

## Session

```env
SESSION_SECRET=replace-with-a-random-secret
SESSION_EXPIRE_HOUR=24
```

生产环境必须使用随机 Session Secret，并通过 HTTPS 提供服务。
