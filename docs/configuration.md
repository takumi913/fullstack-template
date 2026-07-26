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
SESSION_EXPIRE_HOUR=24
# HTTPS 部署必须设为 true，否则会话 Cookie 可能被明文传输
COOKIE_SECURE=false
```

会话 token 为随机生成，服务端只保存其 SHA-256 哈希，因此不需要额外的签名密钥。
生产环境请通过 HTTPS 提供服务并设置 `COOKIE_SECURE=true`。

## CORS

```env
# 允许跨域访问的前端来源，逗号分隔
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
```
