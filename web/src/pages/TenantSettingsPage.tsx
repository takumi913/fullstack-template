import { useTranslation } from "react-i18next";
import { useState } from "react";
import { tenantApi, type Tenant } from "@/api";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useTenantStore } from "@/store/tenantStore";
import { Input } from "./LoginPage";
import { SettingsPage } from "@/components/layout/SettingsPage";

export default function TenantSettingsPage() {
  const { t } = useTranslation(["app", "common"]);
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
    <SettingsPage title={t("workspace.title")} description={t("workspace.description")}>
      <div className="grid gap-6 lg:grid-cols-2">
        {activeTenant && (
          <CurrentTenantForm key={activeTenant.id} tenant={activeTenant} reload={loadTenants} />
        )}
        <form onSubmit={create} className="panel p-6">
          <h2 className="text-lg font-medium">{t("workspace.newTitle")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("workspace.newDescription")}</p>
          <div className="mt-6">
            <Input label={t("common:fields.name")} value={newName} onChange={setNewName} />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </div>
          <div className="mt-6 border-t pt-5">
            <button className="button-primary" disabled={pending}>
              {pending ? t("common:actions.creating") : t("workspace.create")}
            </button>
          </div>
        </form>
      </div>
    </SettingsPage>
  );
}

function CurrentTenantForm({ tenant, reload }: { tenant: Tenant; reload: () => Promise<void> }) {
  const { t } = useTranslation(["app", "common"]);
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
      <h2 className="text-lg font-medium">{t("workspace.current")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("workspace.currentDescription")}</p>
      <div className="mt-6 space-y-5">
        <Input label={t("common:fields.name")} value={name} onChange={setName} />
        <Input label="Slug" value={slug} onChange={setSlug} />
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
      <div className="mt-6 border-t pt-5">
        <button className="button-primary" disabled={pending}>
          {pending ? t("common:actions.saving") : t("common:actions.save")}
        </button>
      </div>
    </form>
  );
}
