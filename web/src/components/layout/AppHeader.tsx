import { For, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { localizedPath } from "@/i18n/locales";
import { useLocale, useTranslation } from "@/i18n/context";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { useAuth } from "@/store/AppState";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ShortLanguageToggle } from "./ShortLanguageToggle";

const paths = ["/dashboard", "/settings/profile", "/settings/security"];

export function AppHeader() {
  const locale = useLocale();
  const { t } = useTranslation("app");
  const copy = () => toolsmithPrivateCopy(locale());
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { error, pending, run } = createAsyncAction();
  async function signOut() {
    if (await run(auth.logout)) navigate(localizedPath("/", locale()));
  }
  return (
    <aside class="design-sidebar">
      <Brand />
      <a class="design-account-profile" href={localizedPath("/settings/profile", locale())}>
        <span class="design-account-icon">
          {auth.state.user?.username.slice(0, 1).toUpperCase()}
        </span>
        <div class="design-account-info">
          <div class="design-account-info-name">{auth.state.user?.username}</div>
          <div class="design-account-info-meta">{auth.state.user?.email}</div>
        </div>
      </a>
      <nav class="design-account-nav">
        <For each={copy().nav}>
          {(label, index) => (
            <a
              class={[
                "design-account-link",
                { active: location.pathname === localizedPath(paths[index()], locale()) },
              ]}
              aria-current={
                location.pathname === localizedPath(paths[index()], locale()) ? "page" : undefined
              }
              href={localizedPath(paths[index()], locale())}
            >
              <span class="design-account-nav-dot" />
              {label}
            </a>
          )}
        </For>
        <Show when={auth.state.user?.is_admin}>
          <a
            class={[
              "design-account-link",
              { active: location.pathname === localizedPath("/admin/users", locale()) },
            ]}
            aria-current={
              location.pathname === localizedPath("/admin/users", locale()) ? "page" : undefined
            }
            href={localizedPath("/admin/users", locale())}
          >
            <span class="design-account-nav-dot" />
            {t("adminUsers.title")}
          </a>
        </Show>
      </nav>
      <div class="design-sidebar-account">
        <div class="design-sidebar-controls">
          <ShortLanguageToggle />
          <ThemeToggle />
        </div>
        <div class="design-user-row">
          <span class="design-user-avatar">
            {auth.state.user?.username.slice(0, 1).toUpperCase()}
          </span>
          <div class="design-user-info">
            <div class="design-user-name">{auth.state.user?.username}</div>
            <div class="design-user-email">{auth.state.user?.email}</div>
          </div>
          <button
            type="button"
            class="design-signout"
            disabled={pending()}
            onClick={() => void signOut()}
          >
            {copy().signOut}
          </button>
        </div>
        {error() && (
          <p class="text-sm text-destructive" role="alert">
            {error()}
          </p>
        )}
      </div>
    </aside>
  );
}
