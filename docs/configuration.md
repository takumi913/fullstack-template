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
VITE_SITE_FAVICON=/favicon.svg
VITE_SITE_LOCALE=zh-CN
VITE_SITE_PRIMARY_KEYWORD=example online tool
VITE_SITE_TITLE=Example Online Tool
VITE_SITE_DESCRIPTION=Describe the primary user value here.
VITE_SITE_IMAGE=/og-image.svg
# 可选：首页直接运行某个 ToolPageDefinition
VITE_HOME_PRIMARY_TOOL_SLUG=image-translator

# 生产 CI / Docker 构建建议开启。
# 开启后会校验 canonical 域名，并阻止原始母模板品牌/title/description
# 与 status=example 的模板示例内容被直接上线。
SEO_STRICT=true

# 只用于母模板仓库自己的 CI/测试；真实生产站不要开启。
SEO_ALLOW_TEMPLATE_EXAMPLES=false
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
品牌名、标题、描述、主关键词、favicon、OG 图片、首页核心工具等构建期值。

本地开发可以不设置 `SEO_STRICT`。生产 strict 模式要求显式提供真实的
`VITE_SITE_URL`，但品牌、title、description 不需要在环境变量里重复填写：
构建会先读取可编辑的 `site-config.ts`，再用存在的 `VITE_SITE_*` 做可选覆盖。

strict 最终校验的是“解析后的站点身份”，并与不可编辑的 `scaffold-sentinels.ts`
中的原始脚手架值比较。因此只要你已经把 `site-config.ts` 改成真实品牌，
`VITE_SITE_NAME`、`VITE_SITE_TITLE`、`VITE_SITE_DESCRIPTION` 都可以省略。

strict 模式还会拒绝 `status: "example"` 的 Tool/Landing 页面；母模板自己的 CI 通过
`SEO_ALLOW_TEMPLATE_EXAMPLES=true` 保留示例覆盖，真实生产站不要开启这个例外。

最小生产构建只需要：

```bash
VITE_SITE_URL=https://your-domain.com SEO_STRICT=true bun run build
```

只有同一份代码需要按部署环境覆盖品牌时，才额外传 `VITE_SITE_NAME`、
`VITE_SITE_TITLE`、`VITE_SITE_DESCRIPTION` 等变量。

如果品牌已经写入 `site-config.ts`，Docker 最小生产构建只需要：

```bash
docker build \
  --build-arg VITE_SITE_URL=https://your-domain.com \
  --build-arg SEO_STRICT=true \
  .
```

Dockerfile 中的品牌类 build args 默认为空，会自动回退到 `site-config.ts`。
只有同一份源码需要按部署环境覆盖品牌时，才额外传：

```bash
--build-arg VITE_SITE_NAME="Your Product"
--build-arg VITE_SITE_SHORT_NAME="Your Product"
--build-arg VITE_SITE_MARK=Y
--build-arg VITE_SITE_FAVICON=/brand-icon.svg
--build-arg VITE_SITE_LOCALE=en
--build-arg VITE_SITE_PRIMARY_KEYWORD="your primary keyword"
--build-arg VITE_SITE_TITLE="Your SEO Title"
--build-arg VITE_SITE_DESCRIPTION="Your product description"
--build-arg VITE_SITE_IMAGE=/og-image.png
--build-arg VITE_HOME_PRIMARY_TOOL_SLUG=image-translator
```

`SEO_ALLOW_TEMPLATE_EXAMPLES=true` 仅用于母模板自身 CI/测试，不要在真实生产镜像中开启。
