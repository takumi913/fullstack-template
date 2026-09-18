# SEO Landing Page 开发指南

工具站不应该把所有关键词都塞进工具页。这个模板把公开 SEO 页面分成两类：

- **Tool Page**：用户搜索后希望立即完成任务，例如 `json formatter`、`image translator`。
- **Landing Page**：用户希望理解场景、比较选择或学习流程，例如 use case、comparison、guide。

## 支持的 Landing Page 类型

| kind | URL | 典型搜索意图 |
| --- | --- | --- |
| `use-case` | `/use-cases/<slug>` | “如何用 X 完成 Y” |
| `comparison` | `/compare/<slug>` | “A vs B / A 和 B 区别” |
| `guide` | `/guides/<slug>` | 教程、流程、解释型搜索 |

配置统一放在：

```text
web/src/content/landing-pages.ts
```

## 示例

```ts
{
  slug: "translate-product-images",
  kind: "use-case",
  status: "published",
  path: "/use-cases/translate-product-images",
  locale: "en",
  primaryKeyword: "translate product images",
  title: "How to Translate Product Images Online",
  description: "...",
  h1: "Translate Product Images for International Stores",
  intro: "...",
  sections: [
    {
      heading: "Upload the original product image",
      body: "...",
    },
  ],
  faq: [],
  relatedToolSlugs: ["image-translator"],
  updatedAt: "2026-09-18",
}
```

## 状态

- `draft`：不生成公开页面。
- `example`：生成 SSG 页面，但自动 noindex。
- `published`：默认可索引并进入 sitemap。

## 自动获得

Landing Page 会自动获得：

- SSG HTML
- title / description
- canonical
- robots
- Open Graph / Twitter Card
- WebPage JSON-LD
- BreadcrumbList JSON-LD
- FAQPage JSON-LD（存在 FAQ 时）
- sitemap 管理
- Related Tools 内链
- build-time SEO verification

## Tool Page 和 Landing Page 不要互相复制

一个关键词只应该有一个主要页面承担主要搜索意图。

例如：

```text
/tools/json-formatter
    -> 立即格式化 JSON

/use-cases/json-api-debugging
    -> API 调试工作流

/compare/json-formatter-vs-validator
    -> Formatter 和 Validator 的区别

/guides/json-syntax
    -> JSON 语法教程
```

不要把同一份正文换关键词后复制到几十个 URL。程序化 SEO 的规模应该来自真实的数据、用途和搜索意图差异。

## 发布前检查

1. primaryKeyword 是否对应独立搜索意图。
2. path 与 kind 是否一致。
3. H1、title、description 是否围绕同一主题。
4. 页面是否提供 Tool Page 没有提供的额外价值。
5. relatedToolSlugs 是否真的与页面任务相关。
6. example 页面确认 noindex。
7. published 页面确认进入 sitemap。
8. 运行 `bun run build`，让 `seo:verify` 检查最终 HTML。
