import type { SeoPage } from "./page";

export const publicSeoPages = {
  home: {
    path: "/",
    primaryKeyword: "go react saas template",
    title: "Go + React 多租户 SaaS 全栈模板",
    description:
      "基于 Go、React、sqlc、SQLite/PostgreSQL 和多租户 RBAC 的精简 SaaS 全栈母模板。",
    h1: "Go + React 多租户 SaaS 全栈模板",
    intent: "commercial",
    updatedAt: "2026-09-18",
    relatedPages: ["/legal/privacy-policy", "/legal/terms"],
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
  (page) => !page.noindex,
);
