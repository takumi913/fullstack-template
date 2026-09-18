import { absoluteUrl, siteConfig } from "./site";
import type { SeoPage } from "./page";

export const publicSeoPages = {
  home: {
    path: "/",
    primaryKeyword: "go react saas template",
    title: "Go + React 多租户 SaaS 全栈模板",
    description: "基于 Go、React、sqlc、SQLite/PostgreSQL 和多租户 RBAC 的精简 SaaS 全栈母模板。",
    h1: "Go + React 多租户 SaaS 全栈模板",
    intent: "commercial",
    updatedAt: "2026-09-18",
    relatedPages: ["/tools", "/resources", "/legal/privacy-policy", "/legal/terms"],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: absoluteUrl("/"),
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: absoluteUrl("/"),
        description: siteConfig.defaultDescription,
      },
    ],
  },
  tools: {
    path: "/tools",
    primaryKeyword: "online tools",
    locale: "en",
    title: "Online Tools | Fullstack Template",
    description:
      "Browse the reusable example tools included with the SEO-ready fullstack template.",
    h1: "Online Tools",
    intent: "commercial",
    updatedAt: "2026-09-18",
    noindex: true,
  },
  resources: {
    path: "/resources",
    primaryKeyword: "tool guides",
    locale: "en",
    title: "Resources | Fullstack Template",
    description:
      "Browse example use cases, comparisons, and guides connected to the template's tool pages.",
    h1: "Resources",
    intent: "informational",
    updatedAt: "2026-09-18",
    noindex: true,
  },
  privacy: {
    path: "/legal/privacy-policy",
    primaryKeyword: "privacy policy",
    title: "隐私政策 | Fullstack Template",
    description: "Fullstack Template 的隐私政策与数据处理说明。",
    h1: "隐私政策",
    intent: "legal",
    updatedAt: "2026-09-18",
  },
  terms: {
    path: "/legal/terms",
    primaryKeyword: "terms of service",
    title: "服务条款 | Fullstack Template",
    description: "Fullstack Template 的服务条款与模板使用说明。",
    h1: "服务条款",
    intent: "legal",
    updatedAt: "2026-09-18",
  },
} satisfies Record<string, SeoPage>;

export const indexableSeoPages = Object.values(publicSeoPages).filter(
  (page) => !("noindex" in page) || !page.noindex,
);
