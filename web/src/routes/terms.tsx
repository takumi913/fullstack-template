import TermsPage from "@/pages/TermsPage";
import { localeFromPath } from "@/i18n/locales";
import { createSeoMeta, withPageMeta } from "@/seo/page";
import { getPublicSeoPages } from "@/seo/pages";
export const meta = (pathname: string) =>
  createSeoMeta(getPublicSeoPages(localeFromPath(pathname)).terms);
export default withPageMeta(TermsPage, meta);
