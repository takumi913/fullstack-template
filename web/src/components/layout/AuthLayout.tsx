import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { PrivateI18nProvider } from "@/i18n/PrivateI18nProvider";
import { PublicRoute } from "@/router/RouteGuards";
import { useLocale } from "@/i18n/context";
import { toolsmithPrivateCopy } from "@/config/toolsmith-private-copy";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ShortLanguageToggle } from "./ShortLanguageToggle";
import { DotField, PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";

function AuthShell(props: { children?: JSX.Element }) {
  const locale = useLocale();
  const copy = () => toolsmithPrivateCopy(locale());
  return (
    <div class="design-site">
      <PointerGlow />
      <section class="design-auth" data-screen-label="Auth">
        <div class="design-auth-form-side">
          <header class="design-auth-header">
            <Brand />
            <div class="design-auth-actions">
              <ShortLanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main class="design-auth-center">{props.children}</main>
        </div>
        <aside class="design-auth-art">
          <DotField intensity={0.8} />
          <div class="design-auth-art-content">
            <div class="design-auth-brandline">{copy().brandLine}</div>
            <div class="design-auth-brand-points">
              <For each={copy().brandPts}>
                {(point) => (
                  <div class="design-auth-brand-point">
                    <span class="design-small-diamond" aria-hidden="true" />
                    {point}
                  </div>
                )}
              </For>
            </div>
          </div>
        </aside>
      </section>
      <CommandPalette />
    </div>
  );
}
export function AuthLayout(props: { children?: JSX.Element }) {
  return (
    <PrivateI18nProvider>
      <PublicRoute>
        <AuthShell>{props.children}</AuthShell>
      </PublicRoute>
    </PrivateI18nProvider>
  );
}
