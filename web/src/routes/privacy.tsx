import PrivacyPage from "@/pages/PrivacyPage";
import { createSeoMeta, type SeoPage } from "@/seo/page";

export const seo: SeoPage = {
  path: "/legal/privacy-policy",
  primaryKeyword: "privacy policy",
  title: "隐私政策 | Fullstack Template",
  description: "Fullstack Template 的隐私政策与数据处理说明。",
  h1: "隐私政策",
  intent: "legal",
};

export const meta = () => createSeoMeta(seo);

export default PrivacyPage;
