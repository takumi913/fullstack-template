import { useState } from "react";
import { tenantApi, type Tenant } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useTenantStore } from "@/store/tenantStore";
import { Input } from "./LoginPage";
import { SettingsPage } from "./ProfileSettingsPage";

export default function TenantSettingsPage() {
  const { activeTenant, loadTenants } = useTenantStore();
  const [newName, setNewName] = useState("");
  const { error, pending, run } = useAsyncAction();

  function create(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      await tenantApi.create({ name: newName, slug: "" });
      setNewName("");
      await loadTenants();
    });
  }

  return (
    <SettingsPage title="工作区设置" description="管理当前工作区，或创建一个新的工作区。">
      <div className="grid gap-6 lg:grid-cols-2">
        {activeTenant && (
          <CurrentTenantForm key={activeTenant.id} tenant={activeTenant} reload={loadTenants} />
        )}
        <form onSubmit={create} className="panel p-6">
          <h2 className="text-lg font-medium">新建工作区</h2>
          <p className="mt-1 text-sm text-zinc-500">为另一个团队或项目创建独立空间。</p>
          <div className="mt-6">
            <Input label="名称" value={newName} onChange={setNewName} />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </div>
          <div className="mt-6 border-t pt-5">
            <button className="button-primary" disabled={pending}>
              {pending ? "创建中…" : "创建工作区"}
            </button>
          </div>
        </form>
      </div>
    </SettingsPage>
  );
}

function CurrentTenantForm({ tenant, reload }: { tenant: Tenant; reload: () => Promise<void> }) {
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const { error, pending, run } = useAsyncAction();

  function update(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      await tenantApi.update(tenant.id, { name, slug });
      await reload();
    });
  }

  return (
    <form onSubmit={update} className="panel p-6">
      <h2 className="text-lg font-medium">当前工作区</h2>
      <p className="mt-1 text-sm text-zinc-500">更新名称和 URL 标识。</p>
      <div className="mt-6 space-y-5">
        <Input label="名称" value={name} onChange={setName} />
        <Input label="Slug" value={slug} onChange={setSlug} />
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
      <div className="mt-6 border-t pt-5">
        <button className="button-primary" disabled={pending}>
          {pending ? "保存中…" : "保存更改"}
        </button>
      </div>
    </form>
  );
}
