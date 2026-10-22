import { useLocation } from "@solidjs/router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";

export function ShortLanguageToggle() {
  const locale = useLocale();
  const location = useLocation();
  const next = () => (locale() === "en" ? "zh-CN" : "en");
  return (
    <a class="design-short-language" href={localizedPath(location.pathname, next())} lang={next()}>
      {locale() === "en" ? "中文" : "EN"}
    </a>
  );
}
