import PrivacyPage from "@/pages/PrivacyPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta, withPageMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
export const meta = (pathname: string) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(pathname)).privacy);
export default withPageMeta(PrivacyPage, meta);
