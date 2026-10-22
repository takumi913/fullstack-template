import HomePage from "@/pages/HomePage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta, withPageMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
export const meta = (pathname: string) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(pathname)).home);
export default withPageMeta(HomePage, meta);
