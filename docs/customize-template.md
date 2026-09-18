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

生产构建必须设置：

```env
VITE_SITE_URL=https://your-domain.com
VITE_SITE_NAME=Your Product
VITE_SITE_TITLE=Your SEO Title
VITE_SITE_DESCRIPTION=Your product description
SEO_STRICT=true
```

strict 模式会阻止：

- localhost / 保留测试域名
- example.com / .test / .example / .invalid
- 默认母模板品牌
- 默认母模板 title
- 默认母模板 description

这样可以避免复制模板后忘记改品牌就部署。

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

正式工具从 `draft` / `example` 改成 `published` 后，才会默认进入 sitemap。

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

## 6. OG 图片

默认：

```text
VITE_SITE_IMAGE=/og-image.svg
```

如果继续使用这个路径，production build 会根据当前：

- VITE_SITE_NAME
- VITE_SITE_MARK
- VITE_SITE_TITLE
- VITE_SITE_DESCRIPTION
- VITE_SITE_URL

自动生成一张不会泄漏母模板旧品牌的 OG SVG。

有正式视觉设计时，直接改成：

```env
VITE_SITE_IMAGE=/og-image.png
```

并把对应文件放入 `web/public/`。

## 7. 删除不需要的示例

母模板示例均默认 noindex，但正式项目仍建议删除不用的示例：

- JSON Formatter
- Word Counter
- 示例 Use Case
- 示例 Comparison
- 示例 Guide
- 示例日语页面

保留示例不会进入 sitemap，但删除后项目更干净。

## 8. 最终生产检查

运行：

```bash
cd web
VITE_SITE_URL=https://your-domain.com \
VITE_SITE_NAME="Your Product" \
VITE_SITE_TITLE="Your SEO Title" \
VITE_SITE_DESCRIPTION="Your product description" \
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
生产 VITE_SITE_*
      ↓
bun run build
      ↓
Search Console / analytics
```

不要先批量生成 SEO 页面。先完成核心工具、首页和少量高意图页面，再根据真实搜索数据扩展。
