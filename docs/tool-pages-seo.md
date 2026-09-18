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
  status: "published",
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
- `example`：会生成 SSG 页面，但自动 `noindex`，适合模板示例和开发预览。
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

在 `src/tools/registry.tsx` 将 slug 与组件对应：

```ts
"image-translator": ImageTranslatorTool,
```

slug 必须与 `tool-pages.ts` 一致。

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
- 首页和页脚发现路径

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
6. 设置正确的 `VITE_SITE_URL`。
7. 将状态从 `example` / `draft` 改为 `published`。
8. 运行 `bun run build` 并检查生成的 sitemap。

## 批量 / 程序化 SEO

不要直接用 AI 批量生成数千个近似页面。

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
