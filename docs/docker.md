# Docker 部署

镜像使用多阶段构建：Node + Bun 构建前端、golang 编译后端、alpine 运行，
最终镜像只包含一个静态链接的二进制和静态文件。

因为使用纯 Go 的 `modernc.org/sqlite`，构建时 `CGO_ENABLED=0`，不需要 gcc。

## 本地运行

默认使用 SQLite：

```bash
docker compose up --build
```

数据库文件通过 `./data` 挂载持久化到宿主机。容器以 uid/gid 1000 的非 root 用户运行，
宿主机上的挂载目录需要对该 uid 可写。

启用附带的 PostgreSQL：

```bash
docker compose --profile postgres up -d postgres
```

然后给应用设置 `DB_DRIVER=postgres` 和对应的 `DB_*` 变量。
迁移会在应用启动时按当前数据库方言自动执行，无需手动操作。

## 只构建镜像

```bash
make docker              # 等价于 docker build -t fullstack-template .
```

不需要先跑 `make build`：Dockerfile 自带完整构建阶段，而 `.dockerignore`
会把本地的 `web/dist`、`static`、`server` 排除在构建上下文之外。

## 部署到生产环境

SEO 的 canonical、Open Graph URL 和 sitemap 域名会在**前端构建阶段**写入静态文件。
因此仅在容器运行时设置 `VITE_SITE_URL` 无效。

如果已经按母模板流程把真实品牌写入 `web/src/config/site-config.ts`，最小生产镜像构建是：

```bash
docker build \
  --build-arg VITE_SITE_URL=https://tools.example.com \
  --build-arg SEO_STRICT=true \
  --build-arg VITE_SITE_IMAGE=/og-image.png \
  -t example-tools .
```

其中 `/og-image.png` 必须真实存在于 `web/public/`。

如果同一份源码要按部署环境覆盖品牌，再额外传：

```bash
--build-arg VITE_SITE_NAME="Example Tools"
--build-arg VITE_SITE_SHORT_NAME="Example"
--build-arg VITE_SITE_MARK=E
--build-arg VITE_SITE_LOCALE=en
--build-arg VITE_SITE_PRIMARY_KEYWORD="example tools"
--build-arg VITE_SITE_TITLE="Example Tools - Online Utilities"
--build-arg VITE_SITE_DESCRIPTION="Useful browser-based tools for Example users."
```

`SEO_STRICT=true` 会验证 canonical、站点身份、模板示例和分享图等生产条件，
用于避免带着母模板默认值上线。

`docker-compose.yml` 的 canonical 本地默认值为 `http://localhost:1323`；其余品牌类 build args
默认传空字符串，因此会回退到 `site-config.ts`，不会覆盖你已经修改的源码品牌。
生产环境可以通过同名环境变量按需覆盖。

`docker-compose.yml` 里的运行时配置面向本地开发，直接用于生产至少需要调整三处：

```yaml
environment:
  # HTTPS 部署必须为 true，否则会话 Cookie 可能被明文传输
  COOKIE_SECURE: "true"
  # 允许跨域的前端来源，不接受 *，配置非法会在启动时报错退出
  CORS_ALLOW_ORIGINS: "https://app.example.com"
  # 位于 Nginx / 云负载均衡之后时必须为 true，
  # 否则限流会把所有用户当成同一个 IP，一个人触发就会导致全站无法登录
  TRUST_PROXY: "true"
```

完整配置项见 [`configuration.md`](configuration.md)。

## CI 生产镜像烟雾测试

仓库 CI 不只分别编译前端和 Go，还会在两者通过后执行完整 Docker smoke：

1. 使用 strict SEO build args 构建三阶段生产镜像；
2. 以非 root 用户启动最终 Alpine 容器；
3. 等待 `/api/v1/health`；
4. 验证首页和预渲染工具页返回 200；
5. 验证随机公开 URL 返回真实 404；
6. 验证 `/dashboard` 带 `X-Robots-Tag: noindex, nofollow`；
7. 验证最终 `robots.txt` / `sitemap.xml` 使用镜像构建时的 canonical 域名。

模板 CI 会显式传 `SEO_ALLOW_TEMPLATE_EXAMPLES=true` 和
`SEO_ALLOW_SVG_SOCIAL_IMAGE=true`，只为了保留 demo/自动 SVG fallback 的覆盖。
真实生产镜像不要开启这两个例外。

## 已知限制

以下几点在模板中尚未处理，正式部署前建议自行加固：

- **镜像内没有时区数据**，`time.LoadLocation` 在容器里会失败。需要时区支持时
  安装 `tzdata` 或在代码中导入 `time/tzdata`。
- **健康检查只探测 `/api/v1/health`**，该接口返回静态 JSON，即使前端静态文件
  缺失也会返回 200，此时容器被判定为健康但所有页面都是 404。
