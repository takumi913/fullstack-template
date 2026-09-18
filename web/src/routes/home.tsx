import HomePage from "@/pages/HomePage";
import { createSeoMeta, type SeoPage } from "@/seo/page";

export const seo: SeoPage = {
  path: "/",
  primaryKeyword: "go react saas template",
  title: "Go + React 多租户 SaaS 全栈模板",
  description:
    "基于 Go、React、sqlc、SQLite/PostgreSQL 和多租户 RBAC 的精简 SaaS 全栈母模板。",
  h1: "Go + React 多租户 SaaS 全栈模板",
  intent: "commercial",
};

export const meta = () => createSeoMeta(seo);

export default HomePage;
