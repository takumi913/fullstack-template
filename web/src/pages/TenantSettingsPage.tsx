import { createSignal, Show, untrack } from "solid-js";
import { useTranslation } from "@/i18n/context";
import { tenantApi } from "@/api";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useTenant } from "@/store/AppState";
import { Input } from "./LoginPage";
import { SettingsPage } from "@/components/layout/SettingsPage";

export default function TenantSettingsPage() {
  const { t } = useTranslation(["app", "common"]);
  const tenant = useTenant();
  const [newName, setNewName] = createSignal("");
  const { error, pending, run } = createAsyncAction();

  function create(event: SubmitEvent) {
    event.preventDefault();
    const data = { name: newName(), slug: "" };
    void run(async () => {
      await tenantApi.create(data);
      setNewName("");
      await tenant.loadTenants();
    });
  }

  return (
    <SettingsPage title={t("workspace.title")} description={t("workspace.description")}>
      <div class="grid gap-6 lg:grid-cols-2">
        <Show when={tenant.state.activeTenant?.id} keyed>
          {(tenantID) => <CurrentTenantForm tenantID={tenantID} />}
        </Show>
        <form onSubmit={create} class="panel p-6">
          <h2 class="text-lg font-medium">{t("workspace.newTitle")}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{t("workspace.newDescription")}</p>
          <div class="mt-6">
            <Input label={t("common:fields.name")} value={newName()} onChange={setNewName} />
            {error() && <p class="mt-3 text-sm text-destructive">{error()}</p>}
          </div>
          <div class="mt-6 border-t pt-5">
            <button class="button-primary" disabled={pending()}>
              {pending() ? t("common:actions.creating") : t("workspace.create")}
            </button>
          </div>
        </form>
      </div>
    </SettingsPage>
  );
}

function CurrentTenantForm(props: { tenantID: string }) {
  const { t } = useTranslation(["app", "common"]);
  const tenant = useTenant();
  // keyed Show 在切换工作区时重建表单，普通列表刷新不覆盖尚未提交的编辑。
  const initial = untrack(() => ({ ...tenant.state.activeTenant! }));
  const [name, setName] = createSignal(initial.name);
  const [slug, setSlug] = createSignal(initial.slug);
  const { error, pending, run } = createAsyncAction();

  function update(event: SubmitEvent) {
    event.preventDefault();
    const data = { name: name(), slug: slug() };
    const id = props.tenantID;
    void run(async () => {
      await tenantApi.update(id, data);
      await tenant.loadTenants();
    });
  }

  return (
    <form onSubmit={update} class="panel p-6">
      <h2 class="text-lg font-medium">{t("workspace.current")}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t("workspace.currentDescription")}</p>
      <div class="mt-6 space-y-5">
        <Input label={t("common:fields.name")} value={name()} onChange={setName} />
        <Input label="Slug" value={slug()} onChange={setSlug} />
        {error() && <p class="text-sm text-destructive">{error()}</p>}
      </div>
      <div class="mt-6 border-t pt-5">
        <button class="button-primary" disabled={pending()}>
          {pending() ? t("common:actions.saving") : t("common:actions.save")}
        </button>
      </div>
    </form>
  );
}
