import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import AdminUsersPage from "@/pages/AdminUsersPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].adminUsers.title);

export default withPageMeta(AdminUsersPage, meta);
