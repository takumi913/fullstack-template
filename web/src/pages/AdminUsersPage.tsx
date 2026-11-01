import { createSignal, For, onSettled, Show } from "solid-js";
import { adminApi, type User, type UserPage } from "@/api";
import { SettingsPage } from "@/components/layout/SettingsPage";
import { useTranslation } from "@/i18n/context";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useAuth } from "@/store/AppState";

export default function AdminUsersPage() {
  const { t } = useTranslation("app");
  const auth = useAuth();
  return (
    <SettingsPage title={t("adminUsers.title")} description={t("adminUsers.description")}>
      <Show
        when={auth.state.user?.is_admin}
        fallback={
          <p class="panel p-6" role="alert">
            {t("adminUsers.forbidden")}
          </p>
        }
      >
        <UserList />
      </Show>
    </SettingsPage>
  );
}

function UserList() {
  const { t } = useTranslation(["app", "common"]);
  const [search, setSearch] = createSignal("");
  const [query, setQuery] = createSignal("");
  const [result, setResult] = createSignal<UserPage>({
    items: [],
    pagination: { page: 1, page_size: 20, total: 0 },
  });
  const [loaded, setLoaded] = createSignal(false);
  const { error, pending, run } = createAsyncAction();
  let active = true;

  const pagination = () => result().pagination;
  const pages = () => Math.max(1, Math.ceil(pagination().total / pagination().page_size));

  function loadUsers(page: number, submittedQuery: string) {
    // One action serializes searches, pagination and status changes so responses cannot reorder.
    return run(async () => {
      const response = await adminApi.listUsers({ query: submittedQuery, page, page_size: 20 });
      if (!active) return;
      setResult(response.data);
      setQuery(submittedQuery);
      setLoaded(true);
    });
  }

  onSettled(() => {
    void loadUsers(1, "");
    return () => {
      active = false;
    };
  });

  function searchUsers(event: SubmitEvent) {
    event.preventDefault();
    void loadUsers(1, search().trim());
  }

  function changeStatus(user: User) {
    void run(async () => {
      const response = await adminApi.updateUser(user.id, {
        status: user.status === "active" ? "disabled" : "active",
      });
      if (!active) return;
      setResult((current) => ({
        ...current,
        items: current.items.map((item) => (item.id === user.id ? response.data : item)),
      }));
    });
  }

  return (
    <section class="space-y-5" aria-busy={pending() ? "true" : "false"}>
      <form class="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={searchUsers}>
        <label class="min-w-0 flex-1 text-sm font-medium">
          {t("adminUsers.searchLabel")}
          <input
            class="field mt-2 w-full"
            type="search"
            placeholder={t("adminUsers.searchPlaceholder")}
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
          />
        </label>
        <button class="button-primary" disabled={pending()}>
          {t("adminUsers.search")}
        </button>
      </form>
      <Show when={error()}>
        <p class="text-sm text-destructive" role="alert">
          {error()}
        </p>
      </Show>
      <Show when={pending()}>
        <p class="text-sm text-muted-foreground" role="status">
          {t("common:actions.processing")}
        </p>
      </Show>
      <Show when={loaded()}>
        <p class="text-sm text-muted-foreground">
          {t("adminUsers.total", { count: pagination().total })}
        </p>
        <ul class="panel divide-y divide-border" aria-label={t("adminUsers.title")}>
          <For
            each={result().items}
            fallback={<li class="p-6 text-sm text-muted-foreground">{t("adminUsers.empty")}</li>}
          >
            {(user) => (
              <li class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="break-all font-medium">{user.username}</h2>
                    <Show when={user.is_admin}>
                      <span class="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {t("adminUsers.administrator")}
                      </span>
                    </Show>
                  </div>
                  <p class="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                </div>
                <dl class="text-sm">
                  <dt class="text-muted-foreground">{t("adminUsers.status")}</dt>
                  <dd class="mt-1">{t(`adminUsers.${user.status}`)}</dd>
                </dl>
                <div class="sm:col-span-2 lg:col-span-1 lg:justify-self-end">
                  <Show
                    when={!user.is_admin}
                    fallback={
                      <p class="text-sm text-muted-foreground">
                        {t("adminUsers.administratorNote")}
                      </p>
                    }
                  >
                    <button
                      class="button-secondary"
                      type="button"
                      disabled={pending()}
                      onClick={() => changeStatus(user)}
                    >
                      {t(user.status === "active" ? "adminUsers.disable" : "adminUsers.enable")}
                    </button>
                  </Show>
                </div>
              </li>
            )}
          </For>
        </ul>
        <nav
          class="flex flex-wrap items-center justify-between gap-3"
          aria-label={t("adminUsers.pagination")}
        >
          <span class="text-sm text-muted-foreground">
            {t("adminUsers.page", { page: pagination().page, pages: pages() })}
          </span>
          <div class="flex gap-2">
            <button
              class="button-secondary"
              type="button"
              disabled={pending() || pagination().page <= 1}
              onClick={() => void loadUsers(pagination().page - 1, query())}
            >
              {t("adminUsers.previous")}
            </button>
            <button
              class="button-secondary"
              type="button"
              disabled={pending() || pagination().page >= pages()}
              onClick={() => void loadUsers(pagination().page + 1, query())}
            >
              {t("adminUsers.next")}
            </button>
          </div>
        </nav>
      </Show>
    </section>
  );
}
