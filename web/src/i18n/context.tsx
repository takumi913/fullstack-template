import { createContext, untrack, useContext, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createInstance,
  type i18n,
  type Resource,
  type TFunction,
  type TOptions,
  type Namespace,
} from "i18next";
import { commonTranslations } from "./common";
import { supportedLocales, type SiteLocale } from "./locales";

const I18nContext = createContext<{ locale: Accessor<SiteLocale>; instance: i18n }>();

export function SiteI18nProvider(props: {
  locale: SiteLocale;
  resources?: Resource;
  children: JSX.Element;
}) {
  // Each rendered document owns its language instance; concurrent SSG cannot share it.
  const instance = createInstance();
  void instance.init(
    untrack(() => ({
      lng: props.locale,
      supportedLngs: supportedLocales,
      fallbackLng: "en",
      defaultNS: "common",
      resources: Object.fromEntries(
        supportedLocales.map((locale) => [
          locale,
          {
            ...props.resources?.[locale],
            common: commonTranslations[locale],
          },
        ]),
      ),
      initAsync: false,
      interpolation: { escapeValue: false },
    })),
  );
  return (
    <I18nContext value={{ instance, locale: () => props.locale }}>{props.children}</I18nContext>
  );
}

export function useLocale() {
  return useContext(I18nContext).locale;
}

export function useTranslation<Ns extends Namespace = "common">(namespace?: Ns) {
  const { instance, locale } = useContext(I18nContext);
  const translate = instance.t as (key: string, options: TOptions) => string;
  const t = ((key: string, options?: TOptions) =>
    translate(key, {
      lng: locale(),
      ns: namespace ?? "common",
      ...options,
    })) as TFunction<Ns>;
  return { t, i18n: instance };
}
