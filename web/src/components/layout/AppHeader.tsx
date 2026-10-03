import { Link, NavLink, useNavigate } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { useAuthStore } from "@/store/authStore";
import { useTenantStore } from "@/store/tenantStore";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ShortLanguageToggle } from "./ShortLanguageToggle";

export function AppHeader() {
  const locale = useLocale(),
    copy = toolsmithPrivateCopy(locale),
    navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout),
    user = useAuthStore((state) => state.user);
  const activeTenant = useTenantStore((state) => state.activeTenant),
    members = useTenantStore((state) => state.members);
  const { error, pending, run } = useAsyncAction();
  async function signOut() {
    if (await run(logout)) navigate(localizedPath("/", locale));
  }
  const paths = ["/dashboard", "/tenant/members", null, "/tenant/settings"];
  return (
    <aside className="design-sidebar">
      <Brand />
      <Link className="design-workspace-switcher" to={localizedPath("/dashboard", locale)}>
        <span className="design-workspace-icon">
          {activeTenant?.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="design-workspace-info">
          <div className="design-workspace-info-name">{activeTenant?.name}</div>
          <div className="design-workspace-info-meta">
            {members.length} {copy.seats}
          </div>
        </div>
        <span className="design-workspace-caret">⌄</span>
      </Link>
      <nav className="design-workspace-nav">
        {copy.ws.map((label, index) =>
          paths[index] ? (
            <NavLink
              key={label}
              className="design-workspace-link"
              to={localizedPath(paths[index]!, locale)}
            >
              <span className="design-workspace-nav-dot" />
              {label}
            </NavLink>
          ) : (
            <a
              key={label}
              className="design-workspace-link"
              href="#"
              onClick={(event) => event.preventDefault()}
            >
              <span className="design-workspace-nav-dot" />
              {label}
            </a>
          ),
        )}
      </nav>
      <div className="design-sidebar-account">
        <div className="design-sidebar-controls">
          <ShortLanguageToggle />
          <ThemeToggle />
        </div>
        <div className="design-user-row">
          <span className="design-user-avatar">{user?.username.slice(0, 1).toUpperCase()}</span>
          <div className="design-user-info">
            <div className="design-user-name">{user?.username}</div>
            <div className="design-user-email">{user?.email}</div>
          </div>
          <button
            type="button"
            className="design-signout"
            disabled={pending}
            onClick={() => void signOut()}
          >
            {copy.signOut}
          </button>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </aside>
  );
}
