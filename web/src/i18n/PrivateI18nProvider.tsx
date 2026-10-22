import type { JSX } from "@solidjs/web";
import { SiteI18nProvider, useLocale } from "./context";
import { appTranslations } from "./private";
import { supportedLocales } from "./locales";
const resources = Object.fromEntries(
  supportedLocales.map((locale) => [locale, { app: appTranslations[locale] }]),
);
export function PrivateI18nProvider(props: { children: JSX.Element }) {
  const locale = useLocale();
  return (
    <SiteI18nProvider locale={locale()} resources={resources}>
      {props.children}
    </SiteI18nProvider>
  );
}
