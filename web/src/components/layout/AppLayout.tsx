import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { Outlet } from "react-router";
import { ProtectedRoute } from "@/router/RouteGuards";
import { AppHeader } from "./AppHeader";
import { PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";
export function AppLayout() {
  return (
    <PrivateI18nProvider>
      <ProtectedRoute>
        <div className="design-site">
          <PointerGlow />
          <section className="design-workspace" data-screen-label="Workspace">
            <AppHeader />
            <main className="design-workspace-main">
              <Outlet />
            </main>
          </section>
          <CommandPalette />
        </div>
      </ProtectedRoute>
    </PrivateI18nProvider>
  );
}
