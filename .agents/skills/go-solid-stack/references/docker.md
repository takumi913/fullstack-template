# Docker 编译与部署

复制 `assets/Dockerfile`、`assets/docker-compose.yml`、`assets/.dockerignore`。生产镜像只有一个静态链接的 `server` 和 `static/`，没有 Node，也没有 CGO。

## 阶段

1. `oven/bun:<packageManager 版本>-alpine` 只提供 Bun 二进制。不要在构建里 `curl` 安装 Bun。
2. `node:26.12.1-alpine` 复制该 Bun，在 `/app` 对 `web/` 执行 `bun install --frozen-lockfile` 和 `bun run build`。两个基础镜像都用 `--platform=$BUILDPLATFORM`。
3. `golang:<go.mod 版本>-alpine` 同样在宿主架构上交叉编译：`CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags="-s -w" -o server main.go`。`GOPROXY` 是 build arg，默认 `https://proxy.golang.org,direct`。
4. `alpine:3.24` 运行。用户 `app` 的 uid/gid 固定 `1000`。`/app/data` 归该用户。`ENV DB_PATH=/app/data/app.db`，否则默认相对路径会写到 root 拥有的 `/app`，非 root 起不来。

Bun 镜像标签必须等于 `web/package.json` 的 `packageManager` 版本。Go 镜像标签必须等于 `go.mod` 的 `go` 版本。CI 应直接比较这两处，避免 workflow 和 Dockerfile 各写一个版本。

前端产物路径是 `web/dist/client`。运行阶段把它复制为 `/app/static`。不要把 Vite 的 server bundle 打进镜像。

`.dockerignore` 排除 `.git`、`web/node_modules`、`web/dist`、`static`、`server`、`tmp`、`*.db`、`.env`。本地构建产物不应进入上下文。

## 本地

```bash
docker compose up --build
```

SQLite 数据在 `./data`，映射到 `/app/data`。Linux 上这个目录需要对 uid 1000 可写。

PostgreSQL 不进默认启动：

```bash
docker compose --profile postgres up -d postgres
```

应用再设置 `DB_DRIVER=postgres` 和对应的 `DB_*`。迁移在进程启动时按当前驱动执行，不要另做手工迁移步骤。

`make docker` 就是 `docker build -t fullstack-template .`。不要要求先在宿主机编好前端。

## 上线前必须改的运行时配置

这些是容器运行时环境变量，不是前端构建参数：

```env
COOKIE_SECURE=true
CORS_ALLOW_ORIGINS=https://app.example.com
TRUST_PROXY=true
```

`COOKIE_SECURE` 在 HTTPS 上必须为 true。`CORS_ALLOW_ORIGINS` 不接受 `*`，空值和非法 origin 要在启动时失败。位于反向代理后必须 `TRUST_PROXY=true`，否则限流会把所有用户算成代理 IP。

健康检查可以打 `GET /api/v1/health`。它只说明进程在听，不说明静态文件齐全。
