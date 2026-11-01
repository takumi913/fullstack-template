import type { JSX } from "@solidjs/web";
import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { ProtectedRoute } from "@/router/RouteGuards";
import { AppHeader } from "./AppHeader";
import { PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";
export function AppLayout(props: { children?: JSX.Element }) {
  return (
    <PrivateI18nProvider>
      <ProtectedRoute>
        <div class="design-site">
          <PointerGlow />
          <section class="design-account" data-screen-label="Account">
            <AppHeader />
            <main class="design-account-main">{props.children}</main>
          </section>
          <CommandPalette />
        </div>
      </ProtectedRoute>
    </PrivateI18nProvider>
  );
}
