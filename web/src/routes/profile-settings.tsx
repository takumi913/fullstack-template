import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import ProfileSettingsPage from "@/pages/ProfileSettingsPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].profile.title);

export default withPageMeta(ProfileSettingsPage, meta);
