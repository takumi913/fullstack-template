# 从母模板创建一个新工具站

这个仓库的目标不是让你重新设计一次 SEO/路由架构，而是让新站主要通过配置和内容数据启动。

## 最短流程

### 1. 修改站点总配置

首先编辑：

```text
web/src/config/site-config.ts
```

这里集中管理：

- 品牌名
- Header 短名称
- Logo 文字标记
- 默认 locale
- 首页 primary keyword
- 首页 SEO title / description
- 首页文案和 CTA
- Tools / Resources Hub 文案
- 导航标签
- 法律页 SEO 摘要

不要先去 Header、Footer、HomePage 里搜索替换品牌，这些组件已经从站点配置读取。

## 2. 配置生产域名

本地开发可以使用默认值。

如果第 1 步已经把 `site-config.ts` 改成真实品牌，最小生产配置只需要：

```env
VITE_SITE_URL=https://your-domain.com
SEO_STRICT=true
```

`VITE_SITE_NAME`、`VITE_SITE_TITLE`、`VITE_SITE_DESCRIPTION` 等只用于部署时覆盖
`site-config.ts`，不需要重复维护同一份品牌数据。

strict 模式会阻止：

- localhost / 保留测试域名
- example.com / .test / .example / .invalid
- 原始母模板品牌
- 原始母模板 title
- 原始母模板 description
- 仍处于 `status: "example"` 的 Tool / Landing 页面
- 仍带有 `templateExample: true` 的非 draft 页面
- 已发布页面中残留的原始 `Fullstack Template` 品牌

这样可以避免复制模板后忘记改品牌或清理 demo 就部署。

这些“原始模板值”保存在 `web/src/config/scaffold-sentinels.ts`，用于发布保护，不要修改。
你的真实品牌只需要改 `site-config.ts`；生产环境只必须提供 canonical 域名
`VITE_SITE_URL`。需要同一代码多品牌构建时，再使用对应的 `VITE_SITE_*` 覆盖。

## 3. 添加真实工具

编辑：

```text
web/src/content/tool-pages.ts
web/src/tools/
web/src/tools/registry.tsx
```

流程见：

```text
docs/tool-pages-seo.md
```

正式工具不能只改 `status`。把内置 demo 替换成真实工具后，需要：
1. 将 `status` 改成 `published`；
2. 删除 `templateExample: true`。

只做第一步时页面仍会保持 noindex，production strict build 也会拒绝发布。

### 3.1 可选：首页直接承载核心工具

如果这个站只有一个最核心的搜索需求，可以让首页第一屏直接提供工具，而不是先展示营销内容。

长期配置建议直接写在 `site-config.ts`：

```ts
home: {
  primaryToolSlug: "image-translator",
  // ...
},
```

需要在 CI、预览环境或同一代码的不同构建中临时切换时，也可以覆盖：

```env
VITE_HOME_PRIMARY_TOOL_SLUG=image-translator
```

设置后：

- 首页 H1 / title / description 仍由站点 SEO 配置控制；
- 第一屏直接渲染对应 ToolRuntime；
- features、how-to、FAQ、Related Resources / Tools 自动复用；
- 首页会为交互工具启用 hydration；
- 没有配置时首页仍保持纯静态、零 hydration。

如果首页和 `/tools/<slug>` 使用相同 `primaryKeyword`，不要让两个 URL 同时参与排名。
最简单的做法是在这个工具定义上设置：

```ts
noindex: true,
showInDirectory: false,
```

production strict build 会阻止“首页和独立工具页同时用同一个 primary keyword 且都可索引”的配置。

纯免费工具站如果不需要公开登录/注册入口，还可以设置：

```ts
navigation: {
  showAuthLinks: false,
  // ...
}
```

这只隐藏公开 Header 和首页 CTA，不会删除后台认证能力。

## 4. 添加 SEO 内容页

编辑：

```text
web/src/content/landing-pages.ts
```

支持：

- Use Case
- Comparison
- Guide
- localized variants

流程见：

```text
docs/landing-pages-seo.md
```

## 5. 修改法律页面

编辑：

```text
web/src/content/legal-pages.ts
```

上线前必须根据实际产品的数据收集、支付、第三方服务和运营地区更新隐私政策与服务条款。

## 6. Favicon 与 Manifest

默认：

```text
VITE_SITE_FAVICON=/favicon.svg
```

production build 会根据最终解析后的站点 mark（`site-config.ts`，或可选的 `VITE_SITE_MARK` 覆盖）和站点颜色自动生成 SVG favicon，
同时生成包含当前站点 name、shortName、theme color 的 `manifest.webmanifest`。

使用正式图标时可以：

```env
VITE_SITE_FAVICON=/brand-icon.svg
```

并把文件放进 `web/public/`。构建验证会检查本地 favicon 路径对应的文件确实存在。

## 7. OG 图片

默认：

```text
VITE_SITE_IMAGE=/og-image.svg
```

如果继续使用这个路径，production build 会根据最终解析后的：

- site name
- site mark
- SEO title
- SEO description
- VITE_SITE_URL

自动生成一张不会泄漏母模板旧品牌的 OG SVG。品牌值默认来自 `site-config.ts`，
只有存在对应 `VITE_SITE_*` 时才使用部署覆盖。

有正式视觉设计时，直接改成：

```env
VITE_SITE_IMAGE=/og-image.png
```

并把对应文件放入 `web/public/`。

## 8. 删除不需要的示例

母模板示例均默认 noindex，但正式项目仍建议删除不用的示例：

- JSON Formatter
- Word Counter
- 示例 Use Case
- 示例 Comparison
- 示例 Guide
- 示例日语页面

保留示例不会进入 sitemap，但删除后项目更干净。

## 9. 最终生产检查

运行：

```bash
cd web
VITE_SITE_URL=https://your-domain.com \
SEO_STRICT=true \
bun run build
```

成功时最后应看到：

```text
SEO build verification passed.
```

CI 还会额外检查：

- format
- zero-warning lint
- typecheck
- tests
- canonical
- hreflang
- sitemap
- robots
- JSON-LD
- 404
- SPA noindex
- server caching
- API/static route isolation

## 推荐的新站修改顺序

```text
site-config.ts
      ↓
tool-pages.ts
      ↓
真实工具组件
      ↓
landing-pages.ts
      ↓
legal-pages.ts
      ↓
生产 VITE_SITE_URL
      ↓
bun run build
      ↓
Search Console / analytics
```

不要先批量生成 SEO 页面。先完成核心工具、首页和少量高意图页面，再根据真实搜索数据扩展。
