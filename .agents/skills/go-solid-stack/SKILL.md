---
name: go-solid-stack
description: Scaffold or extend a personal full-stack app on this Go + Solid 2 stack (Echo v5, sqlc, SQLite/PostgreSQL, session auth, Makefile, Docker). Use when creating the project layout, local dev/build/debug flow, or container deployment for this template. 用于按这套栈新建或扩展项目。不要用于 SEO 工具站、Cloudflare Kumo，或其他前端框架。
---

# Go + Solid 2 开发模板

按已经定下来的栈新建或扩展项目。这是技术栈模板，不是工具站。不要恢复工具页、Landing、法律页、预渲染、sitemap 或 SEO 发布门禁，也不要换成 React 或 Kumo UI。

## 读哪一份

只读当前步骤需要的文件。

- 选库和锁版本：[references/stack.md](references/stack.md)
- 目录怎么放：[references/layout.md](references/layout.md)
- 本地开发、检查、编译、调试：[references/makefile.md](references/makefile.md)
- 镜像与部署：[references/docker.md](references/docker.md)
- 后端分层、sqlc、会话：[references/backend.md](references/backend.md)
- Solid 2 前端约定：[references/frontend.md](references/frontend.md)

`assets/` 里是要复制进新项目的文件，不是说明。搭新项目时复制它们，再按引用改模块名和品牌，不要重写其中标了「不要改」的检查逻辑。

## 不可改的选择

- 后端是 Go、Echo v5、`database/sql`、sqlc。不要加 ORM，不要手写拼接 SQL。
- SQLite 与 PostgreSQL 各维护一套迁移和查询。同名查询必须两边都有。
- 前端是 Solid 2、Vite、Tailwind CSS v4、Bun。样式只用 `style.css` 的语义类。图标只用 `@lucide/solid`。
- 生产由一个 Go 进程提供 API 和静态文件。镜像里不要跑 Node。
- 账号属于个人。不要加工作区、租户或成员 RBAC。
- 管理员只能由本机 `grant-admin` 授予，注册和资料接口不接受权限字段。
- 后端开发用 `go run .`，不要引入 Air。前端仍用 Vite 开发服务器。

## 新建

1. 复制 `assets/` 中的 Makefile、Docker、sqlc 和忽略文件。不要加 Air 或其他 Go 热重载。
2. 按 [references/layout.md](references/layout.md) 建目录，按 [references/stack.md](references/stack.md) 锁直接依赖。
3. 只放健康检查和空的账号壳。业务规则放 service，不要把旧工具站页面抄回来。
4. 跑 `make tools`、`make sqlc-generate`、`make dev`，确认后端 `1323`、前端 `5173`，以及 `/api` 代理可用。

## 在已有项目上改

先对上目录和分层。改 SQL 时两种方言一起改，然后 `make sqlc-generate`。版本以 `go.mod`、`web/package.json` 和 Makefile 里的工具版本为准，不要在 workflow 里另写一套。
