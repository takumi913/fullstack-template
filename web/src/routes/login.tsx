import { appTranslations } from "@/i18n/private";
import { localeFromPath, localizedPath, supportedLocales } from "@/i18n/locales";
import type { Route } from "./+types/login";
import LoginPage from "@/pages/LoginPage";
import { privatePageTitleMeta } from "@/seo/page";

export const meta = ({ location }: Route.MetaArgs) =>
  privatePageTitleMeta(appTranslations[localeFromPath(location.pathname)].auth.loginTitle);

export const handle = {
  languageAlternates: (path: string) =>
    supportedLocales.map((locale) => ({ hreflang: locale, path: localizedPath(path, locale) })),
};
export default LoginPage;
