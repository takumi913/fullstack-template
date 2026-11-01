# Go + Solid 2 全栈模板

一个精简的个人账号模板，提供邮箱密码认证和数据库 Session。

## 技术栈

- Go 1.26、Echo v5、`database/sql`、sqlc
- SQLite（本地开发）和 PostgreSQL（生产部署）
- Solid 2、Solid Router 2、TypeScript、Vite、Tailwind CSS、Solid Store
- bcrypt 密码哈希、HttpOnly Cookie Session

前端不预装 UI 组件库，页面使用 `style.css` 中的 `.panel`、`.button-primary`、`.field` 等类。
优先使用原生 HTML 交互，复杂组件按实际需要选择兼容 Solid 2 的实现。

Solid 2 及配套 Router、Vite 插件目前使用预发布版本，具体版本锁定在 `web/package.json` 与 `bun.lock`，升级时需一起核实兼容性。

## 核心能力

- 注册、登录、退出、资料和密码管理
- 注册只需邮箱和密码，用户名按邮箱自动生成，之后可在个人资料中修改
- 账号属于个人，没有工作区或成员角色
- 平台管理员可查看、搜索、分页与启停普通用户，禁用时清除全部登录会话
- SQLite/PostgreSQL 独立 migrations 和 sqlc 查询
- 认证边界的接口级测试，前后端均有测试
- English-first i18next：英文根路径 + 简体中文 `/zh-cn`，包含双语隐私政策与服务条款
- Public SSG + Private SPA，适合 SEO 工具站
- Tool Page Schema 自动生成 meta、JSON-LD、sitemap 与相关工具内链
- 可选“首页即核心工具”模式：公开首页保留主题/导航交互，配置后第一屏直接运行主工具
- 多语言工具 URL、hreflang 与共享工具实现
- Use Case / Comparison / Guide 数据驱动 SEO Landing Page

## 从母模板创建新站

复制仓库后，不需要到组件里到处搜索替换品牌。主要修改入口：

```text
web/src/config/site-config.ts      品牌与英文默认 SEO
web/src/config/site-copy.ts        双语首页 / Hub 文案
web/src/i18n/                      英文 + 简体中文 UI 和语言注册表
web/src/content/tool-pages.ts      工具页 SEO / SSG 数据
web/src/content/landing-pages.ts   Use Case / Comparison / Guide
web/src/content/legal-pages.ts     隐私政策与服务条款
```

完整流程见 [新站定制指南](docs/customize-template.md)。

生产构建建议开启 `SEO_STRICT=true`，会阻止占位域名和母模板默认品牌直接上线。

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
db/migrations/sqlite/000004_add_projects.up.sql
db/migrations/postgres/000004_add_projects.up.sql
```

改完 `db/query/` 下的 SQL 后运行 `make sqlc-generate` 重新生成代码，CI 会校验生成结果是否最新。
新增影响查询的表或字段时，同时将对应迁移加入 `sqlc.yaml` 的 schema 来源。

从旧版升级时，`000002_drop_workspaces` 会保留用户与会话，删除工作区、成员关系和会话中的当前工作区字段。

## 平台管理员

所有新旧账号默认都是普通用户。先正常注册账号，再在服务器使用相同的数据库配置授予管理员权限：

```bash
./server grant-admin --user-id '已注册用户ID'
# 开发环境
go run . grant-admin --user-id '已注册用户ID'
```

用户 ID 可从登录后的 `GET /api/v1/auth/session` 响应 `data.user.id` 取得。
命令只为已注册且启用的指定账号授予权限，不按邮箱或注册顺序自动授权。

管理员登录后，侧栏会出现“用户管理”，地址为 `/admin/users`（中文 `/zh-cn/admin/users`）。
支持按用户名或邮箱搜索、分页查看，以及启用和禁用普通账号；重新启用后需重新登录。
管理员账号不提供网页启停入口。公开注册和个人资料接口都不能修改管理员身份。

## 常用命令

```bash
make sqlc-generate   # 由 db/query/ 下的 SQL 生成代码
make sqlc-verify     # 校验生成代码是否最新
make test            # 前后端测试
make lint            # 前后端代码检查
make build           # 构建
```

前端另有：

```bash
cd web
bun run seo:preflight  # 构建前检查域名、品牌、示例内容、首页关键词和静态资源
bun run build          # preflight -> SSG build -> SEO 文件生成 -> 产物验证
bun run format         # 格式化（CI 会检查格式）
```

前端构建先编译浏览器与构建期渲染入口，再由 `scripts/prerender.ts` 输出公开 HTML；生产仅发布 `web/dist/client`，由 Go 托管 API 与静态文件，无需 JavaScript 服务。

生产构建会先执行 `seo:preflight`。配置错误会在真正打包前失败，避免先跑完整 SSG 后才发现问题。

## 文档

- [新站定制指南](docs/customize-template.md) — 从母模板创建一个新工具站的最短流程
- [English-first i18n and SEO](docs/i18n-seo.md) — 语言架构、哥飞需求驱动 SEO、多语言发布流程
- [工具页 SEO / SSG](docs/tool-pages-seo.md) — 新增工具、多语言 URL、关键词配置、预渲染和内链规则
- [Solid 2 性能消融实验](docs/performance-ablation.md) — 四组对照、原始数据与复现命令
- [SEO Landing Page](docs/landing-pages-seo.md) — Use Case、Comparison、Guide 与程序化 SEO 页面规则
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
pkg/middleware/      Session 认证中间件
pkg/model/           用户、会话与请求/响应数据结构
web/                 Solid 2 前端
```
