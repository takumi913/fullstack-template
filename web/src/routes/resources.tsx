import ResourcesPage from "@/pages/ResourcesPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta, withPageMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
export const meta = (pathname: string) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(pathname)).resources);
export default withPageMeta(ResourcesPage, meta);
