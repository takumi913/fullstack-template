import { Building2, ChevronRight, Settings, Users } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";

const links = [
  ["成员", "管理成员与角色", "/tenant/members", Users],
  ["工作区", "名称、标识与新工作区", "/tenant/settings", Building2],
  ["个人设置", "资料与账号安全", "/settings/profile", Settings],
] as const;

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { tenants, activeTenant, loadTenants, selectTenant } = useTenantStore();
  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  return (
    <div className="shell py-12 sm:py-16">
      <div className="flex flex-col gap-5 border-b pb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className=" text-3xl font-semibold tracking-[-0.035em]">
            欢迎回来，{user?.username}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">管理当前工作区和账号设置。</p>
        </div>
        <label className="text-xs font-medium text-zinc-500">
          当前工作区
          <select
            className="field mt-2 block w-full min-w-52"
            value={activeTenant?.id ?? ""}
            onChange={(event) => {
              const tenant = tenants.find((item) => item.id === event.target.value);
              if (tenant) void selectTenant(tenant);
            }}
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="py-9">
        <h2 className="mb-4 text-lg font-medium">当前工作区</h2>
        <div className=" panel flex items-start gap-4 p-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-zinc-50 text-zinc-600">
            <Building2 size={16} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-950">
              {activeTenant?.name ?? "暂无工作区"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {activeTenant ? `/${activeTenant.slug}` : "创建工作区后开始协作。"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">管理</h2>
        <div className="rule-list panel">
          {links.map(([title, description, to, Icon]) => (
            <Link key={to} to={to} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
              <Icon size={17} className="text-zinc-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">{title}</p>
                <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
              </div>
              <ChevronRight size={15} className="text-zinc-400" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
