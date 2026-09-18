import TermsPage from "@/pages/TermsPage";
import { createSeoMeta, type SeoPage } from "@/seo/page";

export const seo: SeoPage = {
  path: "/legal/terms",
  primaryKeyword: "terms of service",
  title: "服务条款 | Fullstack Template",
  description: "Fullstack Template 的服务条款与模板使用说明。",
  h1: "服务条款",
  intent: "legal",
};

export const meta = () => createSeoMeta(seo);

export default TermsPage;
