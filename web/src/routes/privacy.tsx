import PrivacyPage from "@/pages/PrivacyPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
import type { Route } from "./+types/privacy";
export const meta = ({ location }: Route.MetaArgs) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(location.pathname)).privacy);
export const handle = {
  languageAlternates: (path: string) => getPublicSeoPages(localeFromPath(path)).privacy.alternates,
};
export default PrivacyPage;
