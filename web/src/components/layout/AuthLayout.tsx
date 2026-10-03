import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { Outlet } from "react-router";
import { PublicRoute } from "@/router/RouteGuards";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ShortLanguageToggle } from "./ShortLanguageToggle";
import { DotField, PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";

function AuthShell() {
  const copy = toolsmithPrivateCopy(useLocale());
  return (
    <div className="design-site">
      <PointerGlow />
      <section className="design-auth" data-screen-label="Auth">
        <div className="design-auth-form-side">
          <header className="design-auth-header">
            <Brand />
            <div className="design-auth-actions">
              <ShortLanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="design-auth-center">
            <Outlet />
          </main>
        </div>
        <aside className="design-auth-art">
          <DotField intensity={0.8} />
          <div className="design-auth-art-content">
            <div className="design-auth-brandline">{copy.brandLine}</div>
            <div className="design-auth-brand-points">
              {copy.brandPts.map((point) => (
                <div key={point} className="design-auth-brand-point">
                  <span className="design-small-diamond" aria-hidden="true" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
      <CommandPalette />
    </div>
  );
}
export function AuthLayout() {
  return (
    <PrivateI18nProvider>
      <PublicRoute>
        <AuthShell />
      </PublicRoute>
    </PrivateI18nProvider>
  );
}
