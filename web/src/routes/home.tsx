import HomePage from "@/pages/HomePage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
import type { Route } from "./+types/home";
export const meta = ({ location }: Route.MetaArgs) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(location.pathname)).home);
export const handle = {
  languageAlternates: (path: string) => getPublicSeoPages(localeFromPath(path)).home.alternates,
};
export default HomePage;
