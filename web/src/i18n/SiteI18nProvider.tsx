import { createInstance, type Resource } from "i18next";
import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { commonTranslations } from "./common";
import { supportedLocales, type SiteLocale } from "./locales";

export function SiteI18nProvider({
  locale,
  children,
  resources,
}: {
  locale: SiteLocale;
  children: ReactNode;
  resources?: Resource;
}) {
  // Concurrent prerenders must not share a mutable singleton language.
  const [instance] = useState(() => {
    const i18n = createInstance();
    void i18n.init({
      lng: locale,
      supportedLngs: supportedLocales,
      fallbackLng: "en",
      defaultNS: "common",
      resources: Object.fromEntries(
        supportedLocales.map((language) => [
          language,
          {
            ...resources?.[language],
            common: commonTranslations[language],
          },
        ]),
      ),
      initAsync: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
    return i18n;
  });
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
