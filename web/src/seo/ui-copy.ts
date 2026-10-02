import { commonTranslations } from "../i18n/common";
import { normalizeLocale } from "../i18n/locales";

export function publicPageCopy(locale?: string) {
  return commonTranslations[normalizeLocale(locale)];
}
