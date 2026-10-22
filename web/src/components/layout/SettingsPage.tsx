import type { JSX } from "@solidjs/web";
import { useTranslation } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
export function SettingsPage(props: {
  title: string;
  description?: string;
  children: JSX.Element;
}) {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  return (
    <div class="shell py-12 sm:py-16">
      <div class="mb-9 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title !mt-0 !text-4xl">{props.title}</h1>
          {props.description && (
            <p class="mt-2 text-sm text-muted-foreground">{props.description}</p>
          )}
        </div>
        <div class="flex gap-4 text-sm">
          <a
            class="text-muted-foreground hover:text-foreground"
            href={localizedPath("/dashboard", locale())}
          >
            {t("common:navigation.dashboard")}
          </a>
          <a
            class="text-muted-foreground hover:text-foreground"
            href={localizedPath("/settings/security", locale())}
          >
            {t("security.link")}
          </a>
        </div>
      </div>
      {props.children}
    </div>
  );
}
