import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import DashboardPage from "@/pages/DashboardPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].dashboard.manage);

export default withPageMeta(DashboardPage, meta);
