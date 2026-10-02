import { localeFromPath } from "../i18n/locales";
export function resolveDocumentLocale(pathname: string) {
  return localeFromPath(pathname);
}
