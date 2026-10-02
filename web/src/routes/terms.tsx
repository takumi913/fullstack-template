import TermsPage from "@/pages/TermsPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
import type { Route } from "./+types/terms";
export const meta = ({ location }: Route.MetaArgs) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(location.pathname)).terms);
export const handle = {
  languageAlternates: (path: string) => getPublicSeoPages(localeFromPath(path)).terms.alternates,
};
export default TermsPage;
