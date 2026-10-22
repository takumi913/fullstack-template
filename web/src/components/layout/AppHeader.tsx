import { For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { useAuth, useTenant } from "@/store/AppState";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ShortLanguageToggle } from "./ShortLanguageToggle";

export function AppHeader() {
  const locale = useLocale();
  const copy = () => toolsmithPrivateCopy(locale());
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const tenant = useTenant();
  const { error, pending, run } = createAsyncAction();
  async function signOut() {
    if (await run(auth.logout)) navigate(localizedPath("/", locale()));
  }
  const paths = ["/dashboard", "/tenant/members", null, "/tenant/settings"];
  return (
    <aside class="design-sidebar">
      <Brand />
      <a class="design-workspace-switcher" href={localizedPath("/dashboard", locale())}>
        <span class="design-workspace-icon">
          {tenant.state.activeTenant?.name.slice(0, 1).toUpperCase()}
        </span>
        <div class="design-workspace-info">
          <div class="design-workspace-info-name">{tenant.state.activeTenant?.name}</div>
          <div class="design-workspace-info-meta">
            {tenant.state.members.length} {copy().seats}
          </div>
        </div>
        <span class="design-workspace-caret">⌄</span>
      </a>
      <nav class="design-workspace-nav">
        <For each={copy().ws}>
          {(label, index) => (
            <>
              {paths[index()] ? (
                <a
                  class={[
                    "design-workspace-link",
                    { active: location.pathname === localizedPath(paths[index()]!, locale()) },
                  ]}
                  aria-current={
                    location.pathname === localizedPath(paths[index()]!, locale())
                      ? "page"
                      : undefined
                  }
                  href={localizedPath(paths[index()]!, locale())}
                >
                  <span class="design-workspace-nav-dot" />
                  {label}
                </a>
              ) : (
                <a
                  class="design-workspace-link"
                  href="#"
                  onClick={(event) => event.preventDefault()}
                >
                  <span class="design-workspace-nav-dot" />
                  {label}
                </a>
              )}
            </>
          )}
        </For>
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
