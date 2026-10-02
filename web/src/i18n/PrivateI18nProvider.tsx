import type { ReactNode } from "react";
import { SiteI18nProvider } from "./SiteI18nProvider";
import { useLocale } from "./useLocale";
import { appTranslations } from "./private";
import { supportedLocales } from "./locales";
const resources = Object.fromEntries(
  supportedLocales.map((locale) => [locale, { app: appTranslations[locale] }]),
);
export function PrivateI18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  return (
    <SiteI18nProvider locale={locale} resources={resources}>
      {children}
    </SiteI18nProvider>
  );
}
