# Go + React 多租户全栈模板

一个精简的 SaaS 基础模板，提供邮箱密码认证、数据库 Session、组织型多租户和固定 RBAC。

## 技术栈

- Go 1.25、Echo v5、`database/sql`、sqlc
- SQLite（本地开发）和 PostgreSQL（生产部署）
- React 19、TypeScript、Vite、Tailwind CSS、Zustand
- bcrypt 密码哈希、HttpOnly Cookie Session

## 核心能力

- 注册、登录、退出、资料和密码管理
- 注册时自动创建默认工作区
- 一个用户可以加入多个工作区
- Owner、Admin、Member 三种租户角色
- SQLite/PostgreSQL 独立 migrations 和 sqlc 查询
- SQLite/PostgreSQL 集成测试

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

## 常用命令

```bash
make sqlc-generate
make sqlc-verify
make test
make build
make lint
```

## 目录

```text
db/migrations/       SQLite/PostgreSQL migrations
db/query/            sqlc 命名 SQL
db/generated/        sqlc 生成代码
pkg/handler/         HTTP 处理器
pkg/service/         业务逻辑
pkg/repo/            数据访问适配层
pkg/middleware/      Session、租户和权限中间件
web/                  React 前端
```