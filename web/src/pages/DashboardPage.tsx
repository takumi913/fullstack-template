import { For } from "solid-js";
import { ChevronRight, Settings, Shield } from "@lucide/solid";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { useAuth } from "@/store/AppState";

const links = [
  ["profile", "profileDescription", "/settings/profile", Settings],
  ["security", "securityDescription", "/settings/security", Shield],
] as const;

export default function DashboardPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const auth = useAuth();

  return (
    <div class="shell py-12 sm:py-16">
      <div class="border-b pb-9">
        <h1 class=" page-title !mt-0 !text-4xl">
          {t("dashboard.welcome", { username: auth.state.user?.username })}
        </h1>
        <p class="mt-2 text-sm text-muted-foreground">{t("dashboard.description")}</p>
      </div>

      <section class="pt-9">
        <h2 class="mb-4 text-lg font-medium">{t("dashboard.manage")}</h2>
        <div class="rule-list panel">
          <For each={links}>
            {([title, description, to, Icon]) => (
              <a
                href={localizedPath(to, locale())}
                class="flex items-center gap-4 px-5 py-4 hover:bg-card"
              >
                <Icon size={17} class="text-muted-foreground" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-foreground">{t(`dashboard.${title}`)}</p>
                  <p class="mt-0.5 text-sm text-muted-foreground">
                    {t(`dashboard.${description}`)}
                  </p>
                </div>
                <ChevronRight size={15} class="text-muted-foreground" />
              </a>
            )}
          </For>
        </div>
      </section>
    </div>
  );
}
