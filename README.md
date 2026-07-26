# Go + React 多租户全栈模板

一个精简的 SaaS 基础模板，提供邮箱密码认证、数据库 Session、组织型多租户和固定 RBAC。

## 技术栈

- Go 1.25、Echo v5、`database/sql`、sqlc
- SQLite（本地开发）和 PostgreSQL（生产部署）
- React 19、TypeScript、Vite、Tailwind CSS、Zustand
- bcrypt 密码哈希、HttpOnly Cookie Session

前端不预装 UI 组件库，页面使用 `style.css` 中的 `.panel`、`.button-primary`、`.field` 等类。
需要下拉菜单、对话框这类成品组件时用 `bunx shadcn@latest add <组件>` 按需引入。

## 核心能力

- 注册、登录、退出、资料和密码管理
- 注册时自动创建默认工作区
- 一个用户可以加入多个工作区
- Owner、Admin、Member 三种租户角色
- SQLite/PostgreSQL 独立 migrations 和 sqlc 查询
- 权限矩阵与租户隔离的接口级测试，前后端均有测试

## 快速开始

```bash
cp .env.example .env
make deps
make sqlc-generate
make dev
```

`make dev` 会同时启动后端开发服务（Air 热重载）和前端开发服务器（Vite）。

默认使用 `app.db`。切换 PostgreSQL：

```env
DB_DRIVER=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=fullstack_template
DB_SSLMODE=disable
```

## 部署到生产前

以下几项的默认值只适用于本地开发，上线前必须按实际情况调整：

```env
# HTTPS 部署时必须为 true，否则会话 Cookie 可能被明文传输
COOKIE_SECURE=true

# 允许跨域的前端来源，逗号分隔（不接受 *，配置非法会在启动时报错）
CORS_ALLOW_ORIGINS=https://app.example.com

# 部署在 Nginx / 云负载均衡等反向代理后面时必须为 true。
# 否则登录限流会把所有用户算作同一个 IP，一个人触发限流会导致全站无法登录
TRUST_PROXY=true
```

完整配置项见 [`docs/configuration.md`](docs/configuration.md)。

## 新增数据库迁移

在两个方言目录下各放一个同版本号的文件即可，启动时会按版本号顺序自动执行未应用的迁移：

```text
db/migrations/sqlite/000002_add_projects.up.sql
db/migrations/postgres/000002_add_projects.up.sql
```

改完 `db/query/` 下的 SQL 后运行 `make sqlc-generate` 重新生成代码，CI 会校验生成结果是否最新。

## 常用命令

```bash
make sqlc-generate   # 由 db/query/ 下的 SQL 生成代码
make sqlc-verify     # 校验生成代码是否最新
make test            # 前后端测试
make lint            # 前后端代码检查
make build           # 构建
```

前端另有 `bun run format` 格式化（CI 会检查格式）。

## 文档

- [配置说明](docs/configuration.md) — 全部环境变量
- [Docker 部署](docs/docker.md) — 镜像构建、生产配置与已知限制
- [Go 代码检查](docs/golangci-lint.md) — golangci-lint 版本要求与用法
- [Air 热重载](docs/air.md) — 本地开发热重载

## 目录

```text
api/                 路由与接口级测试
configs/             环境变量配置
db/migrations/       SQLite/PostgreSQL migrations
db/query/            sqlc 命名 SQL
db/generated/        sqlc 生成代码
pkg/handler/         HTTP 处理器
pkg/service/         业务逻辑
pkg/repo/            数据访问适配层（在此适配两种数据库方言）
pkg/middleware/      Session、租户和权限中间件
pkg/model/           数据结构与 RBAC 权限矩阵
web/                 React 前端
```