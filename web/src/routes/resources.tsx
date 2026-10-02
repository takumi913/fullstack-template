import ResourcesPage from "@/pages/ResourcesPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
import type { Route } from "./+types/resources";
export const meta = ({ location }: Route.MetaArgs) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(location.pathname)).resources);
export const handle = {
  languageAlternates: (path: string) =>
    getPublicSeoPages(localeFromPath(path)).resources.alternates,
};
export default ResourcesPage;
