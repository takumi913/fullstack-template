import ToolsPage from "@/pages/ToolsPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
import type { Route } from "./+types/tools-index";
export const meta = ({ location }: Route.MetaArgs) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(location.pathname)).tools);
export const handle = {
  languageAlternates: (path: string) => getPublicSeoPages(localeFromPath(path)).tools.alternates,
};
export default ToolsPage;
