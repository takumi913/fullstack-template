# 技术栈

版本只有三个来源：`go.mod` 的 `go` 指令、`web/package.json`（含 `packageManager`）、Makefile 顶部的工具版本。Dockerfile 和 CI 引用这三处，不要在 workflow 里再写死一个会漂移的版本。

下面是这套模板当前锁定的选择。已有项目以仓库里的锁定文件为准；新建项目从这些版本开始。

## 后端

| 用途 | 选择 |
| --- | --- |
| 语言 | Go 1.26.0 |
| HTTP | Echo v5（`github.com/labstack/echo/v5`）。handler 第一参是 `*echo.Context`，不是 v4 的值类型 |
| 数据访问 | `database/sql` + sqlc。无 ORM |
| SQLite | `modernc.org/sqlite`，纯 Go，`CGO_ENABLED=0` |
| PostgreSQL | `github.com/jackc/pgx/v5` |
| 配置 | `godotenv`，缺 `.env` 时用环境变量和默认值，不因此失败 |
| 密码 | `golang.org/x/crypto/bcrypt`，`bcrypt.DefaultCost` |
| ID | `github.com/google/uuid` |
| 日志 | `log/slog` JSON。不要混用标准库 `log` 或 Echo 的 `middleware.Logger()` |

sqlc 不进 `go.mod` 要求，用 Makefile 里的 `SQLC_VERSION` 通过 `go run github.com/sqlc-dev/sqlc/cmd/sqlc@版本 generate` 调用。当前 `v1.30.0`。

## 前端

| 用途 | 选择 |
| --- | --- |
| 语言 | TypeScript |
| UI | Solid 2 与 `@solidjs/web` 同版本锁定。当前 `2.0.0-rc.19` |
| 路由 | `@solidjs/router` `2.0.0-next.42` |
| 构建 | Vite 8 + `@solidjs/vite-plugin` `3.0.0-next.51` |
| CSS | Tailwind CSS v4，由 `@tailwindcss/vite` 接入，不另写 `tailwind.config` |
| 图标 | `@lucide/solid`。不要加第二个图标库 |
| HTTP | axios，`withCredentials: true` |
| 文案 | i18next。英文根路径，简体中文 `/zh-cn` |
| 包管理 | Bun，当前 `packageManager` 为 `bun@1.3.14` |

Solid 2、Router、Vite 插件是一套预发布版本。升级时三个一起改，不要只升其中一个。

没有 UI 组件库。页面复用 `style.css` 的 `.shell`、`.panel`、`.button-primary`、`.button-secondary`、`.field`。不要引入 Kumo、React 组件库或另一套设计系统。

## 工具

Makefile 锁定，并且必须和 CI 使用同一个版本：

- `golangci-lint` `v2.12.2`
- `sqlc` `v1.30.0`

不使用 Air。后端改动后重新跑 `go run .`。

测试用 `go test -race` 和 `vitest`。前端检查是 ESLint 加 Prettier，CI 会跑 `format:check`。
