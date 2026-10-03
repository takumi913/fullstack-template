import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { Building2, ChevronRight, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";

const links = [
  ["members", "membersDescription", "/tenant/members", Users],
  ["workspace", "workspaceDescription", "/tenant/settings", Building2],
  ["profile", "profileDescription", "/settings/profile", Settings],
] as const;

export default function DashboardPage() {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);
  const { tenants, activeTenant, loadTenants, selectTenant } = useTenantStore();
  const [error, setError] = useState("");
  const [switching, setSwitching] = useState(false);
  useEffect(() => {
    loadTenants().catch((caught: Error) => setError(caught.message));
  }, [loadTenants]);

  // 切换期间禁用下拉框：否则连续切换时，先发出的请求可能后返回并覆盖后一次的选择，
  // 造成界面显示的工作区与服务端会话不一致。
  function switchTenant(id: string) {
    const tenant = tenants.find((item) => item.id === id);
    if (!tenant || switching) return;
    setError("");
    setSwitching(true);
    selectTenant(tenant)
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setSwitching(false));
  }

  return (
    <div className="shell py-12 sm:py-16">
      <div className="flex flex-col gap-5 border-b pb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className=" page-title !mt-0 !text-4xl">
            {t("dashboard.welcome", { username: user?.username })}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.description")}</p>
        </div>
        <label className="text-xs font-medium text-muted-foreground">
          {t("dashboard.current")}
          <select
            className="field mt-2 block w-full min-w-52 disabled:opacity-60"
            value={activeTenant?.id ?? ""}
            disabled={switching}
            onChange={(event) => switchTenant(event.target.value)}
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          {error && <p className="mt-2 text-sm font-normal text-destructive">{error}</p>}
        </label>
      </div>

      <section className="py-9">
        <h2 className="mb-4 text-lg font-medium">{t("dashboard.current")}</h2>
        <div className=" panel flex items-start gap-4 p-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-card text-muted-foreground">
            <Building2 size={16} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {activeTenant?.name ?? t("dashboard.empty")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTenant ? `/${activeTenant.slug}` : t("dashboard.emptyDescription")}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">{t("dashboard.manage")}</h2>
        <div className="rule-list panel">
          {links.map(([title, description, to, Icon]) => (
            <Link
              key={to}
              to={localizedPath(to, locale)}
              className="flex items-center gap-4 px-5 py-4 hover:bg-card"
            >
              <Icon size={17} className="text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t(`dashboard.${title}`)}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t(`dashboard.${description}`)}
                </p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
