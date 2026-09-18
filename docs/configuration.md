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


## 前端站点 / SEO 构建

这些变量在**前端构建阶段**读取，不是 Go 服务启动时读取：

```env
VITE_SITE_URL=https://example.com
VITE_SITE_NAME=Example
VITE_SITE_SHORT_NAME=Example
VITE_SITE_MARK=E
VITE_SITE_LOCALE=zh-CN
VITE_SITE_PRIMARY_KEYWORD=example online tool
VITE_SITE_TITLE=Example Online Tool
VITE_SITE_DESCRIPTION=Describe the primary user value here.
VITE_SITE_IMAGE=/og-image.svg

# 生产 CI / Docker 构建建议开启。
# 开启后会校验 canonical 域名，并阻止默认母模板品牌/title/description 被直接上线。
SEO_STRICT=true
```

`VITE_SITE_URL` 必须是纯 origin：

```text
https://example.com        ✅
https://example.com/       ✅ 会规范化
https://example.com/app    ❌
https://example.com?a=1    ❌
```

它会作为 canonical、Open Graph URL、JSON-LD、sitemap 和 robots.txt 的域名来源。
因此生产环境不要依赖默认值 `https://example.com`。

品牌与长文案的默认值集中在 `web/src/config/site-config.ts`。复制模板创建新站时，
优先修改这个文件以及 `web/src/content/` 下的页面数据；`VITE_SITE_*` 变量用于部署时覆盖
品牌名、标题、描述、主关键词、OG 图片等构建期值。

本地开发可以不设置 `SEO_STRICT`。开启 strict 后，除了生产域名外，还必须显式提供
`VITE_SITE_NAME`、`VITE_SITE_TITLE`、`VITE_SITE_DESCRIPTION`，且不能继续使用
`site-config.ts` 中的母模板默认值。

生产 CI、Docker/BuildKit 或发布流水线建议显式设置：

```bash
VITE_SITE_URL=https://your-domain.com SEO_STRICT=true bun run build
```

Docker 构建时通过 build args 注入：

```bash
docker build \
  --build-arg VITE_SITE_URL=https://your-domain.com \
  --build-arg VITE_SITE_NAME="Your Product" \
  --build-arg VITE_SITE_SHORT_NAME="Your Product" \
  --build-arg VITE_SITE_MARK=Y \
  --build-arg VITE_SITE_LOCALE=en \
  --build-arg VITE_SITE_PRIMARY_KEYWORD="your primary keyword" \
  --build-arg VITE_SITE_TITLE="Your SEO Title" \
  --build-arg VITE_SITE_DESCRIPTION="Your product description" \
  --build-arg VITE_SITE_IMAGE=/og-image.png \
  --build-arg SEO_STRICT=true \
  .
```
