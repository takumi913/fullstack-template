import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import TenantMembersPage from "@/pages/TenantMembersPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].members.title);

export default withPageMeta(TenantMembersPage, meta);
