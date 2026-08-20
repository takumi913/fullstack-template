# 配置

项目通过环境变量配置，示例见根目录 `.env.example`。

## 服务

```env
SERVER_HOST=0.0.0.0
SERVER_PORT=1323
```

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

来源列表不能为空，也不接受 `*`（会话使用 Cookie 凭证，通配来源不被允许）。
配置非法时服务会在启动阶段报错退出。

## 反向代理

```env
TRUST_PROXY=false
```

登录和注册接口按客户端 IP 限流。默认只信任 TCP 连接来源；
部署在 Nginx、Traefik、云负载均衡等反向代理后面时**必须**设为 `true`，
否则所有请求的来源 IP 都是代理地址，会被算作同一个客户端——
一个人触发限流就会导致所有用户都无法登录。
