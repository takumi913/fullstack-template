import "i18next";
import type { commonTranslations } from "./common";
import type { appTranslations } from "./private";
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: { common: typeof commonTranslations.en; app: typeof appTranslations.en };
  }
}
