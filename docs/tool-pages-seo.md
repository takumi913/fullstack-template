# 工具页 SEO / SSG 开发指南

这个模板把工具站公开页面拆成两层：

- `src/content/tool-pages.ts`：纯数据，负责 slug、关键词、标题、描述、H1、FAQ、关联工具、索引状态。
- `src/tools/`：真正的 React 工具实现。

React Router 使用同一个 `/tools/:slug` Route Module。构建时读取工具配置自动生成预渲染 URL，所以新增工具不需要重复维护 sitemap 或 prerender 列表。

## 新增一个工具

### 1. 添加 SEO / 页面定义

在 `web/src/content/tool-pages.ts` 添加：

```ts
{
  slug: "image-translator",
  componentKey: "image-translator",
  status: "published",
  locale: "en",
  name: "Image Translator",
  category: "AI Tool",
  primaryKeyword: "image translator",
  title: "AI Image Translator - Translate Images Online",
  description: "Translate text inside images online...",
  h1: "AI Image Translator",
  intro: "Upload an image and translate...",
  features: [
    "Translate text inside images",
    "Preserve the original layout",
  ],
  howToSteps: [
    "Upload an image.",
    "Choose the target language.",
    "Download the translated result.",
  ],
  faq: [
    {
      question: "What image formats are supported?",
      answer: "PNG, JPEG and WebP are supported.",
    },
  ],
  relatedSlugs: ["ocr-tool"],
  updatedAt: "2026-09-18",
  isFree: true,
}
```

状态说明：

- `draft`：不生成公开路由，也不预渲染。
- `example`：会生成 SSG 页面，但自动 `noindex`，适合模板示例和开发预览。公开 noindex 页面仍保持 `follow`。
- `published`：默认允许索引并进入 sitemap。

如果暂时不希望已发布页面被搜索引擎收录，可以显式设置：

```ts
noindex: true
```

## 2. 编写工具组件

创建：

```text
web/src/tools/ImageTranslatorTool.tsx
```

工具组件只负责交互功能，不需要自己处理 title、canonical、JSON-LD、breadcrumb 或 sitemap。

## 3. 注册工具组件

在 `src/tools/registry.tsx` 将 `componentKey` 与组件对应。工具组件使用动态 import，
因此不会把所有工具代码一次性下载：

```ts
"image-translator": lazy(async () => {
  const module = await import("./ImageTranslatorTool");
  return { default: module.ImageTranslatorTool };
}),
```

一个工具实现可以服务多个 SEO 页面。比如日语、韩语图片翻译页面可以使用不同 slug，
但共享 `componentKey: "image-translator"`。需要让交互功能读取页面差异时，将参数放在：

```ts
runtime: {
  targetLanguage: "ja",
}
```

工具组件可以通过 `useToolPageDefinition()` 读取当前页面定义和 runtime 参数。

## 自动获得的 SEO 能力

一个 routable 工具定义会自动得到：

- `/tools/<slug>` URL
- React Router SSG HTML
- title / description
- canonical
- robots
- Open Graph
- Twitter Card
- WebApplication JSON-LD
- BreadcrumbList JSON-LD
- FAQPage JSON-LD（存在 FAQ 时）
- sitemap 收录（仅 indexable 页面）
- Related Tools 内链
- Related Resources 反向主题内链
- 首页、Tools Hub 和页脚发现路径

## 首页作为核心工具入口

如果某个工具就是整个站点的核心搜索需求，可以在 `site-config.ts` 设置：

```ts
home: {
  primaryToolSlug: "image-translator",
}
```

首页会直接复用这个 ToolPageDefinition 的真实工具组件、features、how-to、FAQ 和相关内容。
默认没有配置时，首页仍是静态模板介绍页，不会加载工具客户端运行时。

为了避免关键词内耗，如果首页的 primary keyword 与这个工具页相同，应把独立工具 URL 设置为
`noindex: true`（通常也建议 `showInDirectory: false`），让首页承担这个搜索意图。
production strict build 会校验这一规则。

## 内链规则

`relatedSlugs` 应只填写真正相关的工具，不要为了增加链接数量互相乱链。

CI 会检查：

- slug 唯一
- URL 唯一
- related slug 必须存在
- 工具不能 related 自己
- example 页面必须保持 noindex

## 上线工具前

至少检查：

1. `primaryKeyword` 是否对应真实搜索意图。
2. title、H1、description 是否围绕同一个主要需求。
3. 首屏是否直接提供工具，而不是先堆大段营销文案。
4. 页面是否有真实功能和独立价值，而不是只更换关键词生成近似页面。
5. `relatedSlugs` 是否语义相关。
6. 在**构建阶段**设置正确的 `VITE_SITE_URL`；生产构建建议同时设置 `SEO_STRICT=true`。
7. 将状态从 `example` / `draft` 改为 `published`。
8. 运行 `bun run build` 并检查生成的 sitemap。

## 多语言 SEO

模板支持在 `ToolPageDefinition.alternates`（底层映射为 `SeoPage.alternates`）中声明真实存在的语言版本，并自动输出
`<link rel="alternate" hreflang="...">`。只有当主要内容真正完成本地化后才应该声明 alternate。

可以用 `createHreflangAlternates()` 生成配置：

```ts
alternates: createHreflangAlternates(
  [
    { locale: "en", path: "/tools/image-translator" },
    { locale: "ja", path: "/ja/tools/image-translator" },
  ],
  "/tools/image-translator",
)
```

每个语言版本都必须有自己的 `ToolPageDefinition`。本地化版本使用显式 `path`
作为 canonical URL，例如：

```ts
{
  slug: "image-translator-ja",
  path: "/ja/tools/image-translator",
  locale: "ja",
  componentKey: "image-translator",
}
```

这样 slug 只作为内部唯一标识，实际 SEO URL 由 `path` 决定，并继续复用同一个工具实现。每个版本都应该包含自己和其它版本，并保持双向对应；
CI 会检查目标页面存在、语言匹配和反向链接。`x-default` 用于没有匹配语言时的兜底页面。

模板只采用 HTML hreflang，不在 sitemap 再复制一套相同声明，减少两套配置漂移。

## 批量 / 程序化 SEO

`componentKey` 允许多个关键词页面复用同一个真实工具实现，但不要直接用 AI 批量生成数千个近似页面。

优先把页面看成结构化数据：

```text
keyword
  ↓
search intent
  ↓
ToolPageDefinition
  ↓
真实工具 / 数据
  ↓
SSG HTML
  ↓
内链
  ↓
sitemap / GSC
```

只有在每个页面确实满足不同需求时，才应该扩大页面规模。
