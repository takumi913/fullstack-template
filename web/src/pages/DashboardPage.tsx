import { createSignal, For, onSettled } from "solid-js";
import { Building2, ChevronRight, Settings, Users } from "@lucide/solid";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { useAuth, useTenant } from "@/store/AppState";

const links = [
  ["members", "membersDescription", "/tenant/members", Users],
  ["workspace", "workspaceDescription", "/tenant/settings", Building2],
  ["profile", "profileDescription", "/settings/profile", Settings],
] as const;

export default function DashboardPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const auth = useAuth();
  const tenant = useTenant();
  const [error, setError] = createSignal("");
  const [switching, setSwitching] = createSignal(false);
  let switchingNow = false;
  onSettled(() => {
    void tenant.loadTenants().catch((caught: Error) => setError(caught.message));
  });

  // 串行切换，避免较早请求后返回导致工作区与服务端会话不一致。
  function switchTenant(id: string) {
    const next = tenant.state.tenants.find((item) => item.id === id);
    if (!next || switchingNow) return;
    switchingNow = true;
    setError("");
    setSwitching(true);
    void tenant
      .selectTenant(next)
      .catch((caught: Error) => setError(caught.message))
      .finally(() => {
        switchingNow = false;
        setSwitching(false);
      });
  }

  return (
    <div class="shell py-12 sm:py-16">
      <div class="flex flex-col gap-5 border-b pb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class=" page-title !mt-0 !text-4xl">
            {t("dashboard.welcome", { username: auth.state.user?.username })}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">{t("dashboard.description")}</p>
        </div>
        <label class="text-xs font-medium text-muted-foreground">
          {t("dashboard.current")}
          <select
            class="field mt-2 block w-full min-w-52 disabled:opacity-60"
            value={tenant.state.activeTenant?.id ?? ""}
            disabled={switching()}
            onChange={(event) => switchTenant(event.currentTarget.value)}
          >
            <For each={tenant.state.tenants}>
              {(item) => <option value={item.id}>{item.name}</option>}
            </For>
          </select>
          {error() && <p class="mt-2 text-sm font-normal text-destructive">{error()}</p>}
        </label>
      </div>

      <section class="py-9">
        <h2 class="mb-4 text-lg font-medium">{t("dashboard.current")}</h2>
        <div class=" panel flex items-start gap-4 p-5">
          <div class="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground">
            <Building2 size={16} />
          </div>
          <div>
            <h2 class="text-sm font-medium text-foreground">
              {tenant.state.activeTenant?.name ?? t("dashboard.empty")}
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
              {tenant.state.activeTenant
                ? `/${tenant.state.activeTenant.slug}`
                : t("dashboard.emptyDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
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
