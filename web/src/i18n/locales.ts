import localeDefinitions from "./locales.json";
export const defaultLocale = "en";
export const locales = localeDefinitions;
export type SiteLocale = keyof typeof locales;
export const supportedLocales = Object.keys(locales) as SiteLocale[];

export function localeFromPath(pathname: string): SiteLocale {
  return (
    supportedLocales.find((locale) => {
      const { prefix } = locales[locale];
      return prefix && (pathname === prefix || pathname.startsWith(`${prefix}/`));
    }) || defaultLocale
  );
}
export function unlocalizedPath(pathname: string) {
  const prefix = locales[localeFromPath(pathname)].prefix;
  return pathname.slice(prefix.length) || "/";
}
export function localizedPath(pathname: string, locale: SiteLocale) {
  const path = unlocalizedPath(pathname);
  return `${locales[locale].prefix}${path === "/" ? "" : path}` || "/";
}
export function normalizeLocale(locale: string | undefined): SiteLocale {
  return locale?.toLowerCase() === "zh-cn" || locale === "zh" ? "zh-CN" : defaultLocale;
}
