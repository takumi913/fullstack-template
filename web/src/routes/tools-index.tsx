import ToolsPage from "@/pages/ToolsPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta, withPageMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
export const meta = (pathname: string) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(pathname)).tools);
export default withPageMeta(ToolsPage, meta);
