import { Link, useLocation } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";

export function ShortLanguageToggle() {
  const locale = useLocale(),
    { pathname } = useLocation();
  const next = locale === "en" ? "zh-CN" : "en";
  return (
    <Link className="design-short-language" to={localizedPath(pathname, next)} lang={next}>
      {locale === "en" ? "中文" : "EN"}
    </Link>
  );
}
