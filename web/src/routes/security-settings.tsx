import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import SecuritySettingsPage from "@/pages/SecuritySettingsPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].security.title);

export default withPageMeta(SecuritySettingsPage, meta);
