import { appTranslations } from "@/i18n/private";
import { localeFromPath } from "@/i18n/locales";
import LoginPage from "@/pages/LoginPage";
import { privatePageTitleMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) =>
  privatePageTitleMeta(appTranslations[localeFromPath(pathname)].auth.loginTitle);

export default withPageMeta(LoginPage, meta);
