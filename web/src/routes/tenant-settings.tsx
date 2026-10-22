import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import TenantSettingsPage from "@/pages/TenantSettingsPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].workspace.title);

export default withPageMeta(TenantSettingsPage, meta);
