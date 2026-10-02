import { useTranslation } from "react-i18next";
import { normalizeLocale } from "./locales";
export function useLocale() {
  const { i18n } = useTranslation();
  return normalizeLocale(i18n.language);
}
