# Makefile、开发与调试

复制 `assets/Makefile`。下面这些行为改错了，本地和 CI 会对不上。不要加 Air 或 `.air.toml`。

## 命令

| 命令 | 作用 |
| --- | --- |
| `make tools` | 安装与 CI 同版本的 golangci-lint |
| `make deps` | `go mod download` 加 `bun install --frozen-lockfile`。不要在这里 `go mod tidy` |
| `make dev` | 同时起 `go run .`（`http://localhost:1323`）和 Vite（`http://localhost:5173`）。后端不热重载。退出时杀掉整组进程 |
| `make run` | 运行已构建的 `./server`。没构建就失败，不要偷偷 `go run` |
| `make sqlc-generate` | 按 Makefile 的 `SQLC_VERSION` 生成查询 |
| `make sqlc-verify` | 再生成一次，并用 `git status --porcelain -- db/generated` 检查。不要改成 `git diff`，未跟踪的新文件它看不见 |
| `make test` | `go test -race`，排除 `web/node_modules`；然后 `bun run test` |
| `make lint` | Go lint 加前端 `format:check` 和 ESLint |
| `make build` | `scripts/build.sh`：前端构建、复制到 `static/`、golangci-lint、`CGO_ENABLED=0` 编出 `server` |
| `make docker` | `docker build -t fullstack-template .`。不要要求先本地 `make build` |
| `make clean` | 删除 `web/dist`、`static`、`tmp`、`server` |

`make build-go` 必须是 `CGO_ENABLED=0 go build -o server main.go`。`modernc.org/sqlite` 不需要 CGO，开了反而妨碍交叉编译。

## 调试

- 后端改动后重新跑 `make dev` 或 `go run .`。不要加热重载工具。
- 前端调试用 Vite。接口走代理，不在页面里另建 axios 实例，也不要写死生产地址。
- 数据库默认 SQLite 文件 `app.db`。要看 PostgreSQL 时用 compose 的 `postgres` profile，再把 `DB_DRIVER=postgres` 写进 `.env`。
- 管理员不是网页操作。注册后在服务器上执行 `go run . grant-admin --user-id '<id>'`。

## 工具版本

`GOLANGCI_LINT_VERSION` 和 `SQLC_VERSION` 只定义在 Makefile。CI 的 golangci-lint action 必须使用同一个版本。本地没装 golangci-lint 时 `make lint` 和 `scripts/build.sh` 都要失败，不能跳过。
