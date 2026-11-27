# Go + Solid 2 技术栈模板

这不是可运行的应用，也不是工具站。仓库里只保留一份开发模板 Skill，用来按同一套技术栈新建或扩展项目。

Skill 在 [`.agents/skills/go-solid-stack`](.agents/skills/go-solid-stack)。

## 技术栈

- Go、Echo v5、`database/sql`、sqlc
- SQLite 与 PostgreSQL
- Session 认证，个人账号
- Solid 2、Vite、Tailwind CSS v4、Bun
- Makefile 负责依赖、开发、检查、编译
- Docker 多阶段构建，生产由一个 Go 进程提供 API 和静态文件

不使用 UI 组件库，也不使用 Air。后端开发用 `go run .`，前端开发用 Vite。

具体版本和不能改的约定写在 Skill 里，不要在这里另维护一份。

## 目录

```text
.agents/skills/go-solid-stack/
├── SKILL.md           什么时候用、哪些选择不能改
├── references/        技术栈、目录、Makefile、Docker、前后端约定
└── assets/            可复制进新项目的 Makefile、Dockerfile、sqlc 配置
```

## 使用

在新项目里按 Skill 操作：

1. 复制 `assets/` 里的 Makefile、Docker、sqlc 和忽略文件。
2. 按 `references/layout.md` 建目录，按 `references/stack.md` 锁定依赖。
3. 只放健康检查和空的账号壳。
4. 运行 `make tools`、`make sqlc-generate`、`make dev`。

本地 Agent 若已链接到 `~/.agents/skills/go-solid-stack`，新会话会直接读到这份 Skill。
