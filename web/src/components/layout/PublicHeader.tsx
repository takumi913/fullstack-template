import { useLocation } from "@solidjs/router";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ToolMenu } from "@/components/tools/ToolMenu";

export function PublicHeader() {
  const locale = useLocale();
  const copy = () => toolsmithCopy(locale());
  const location = useLocation();
  const active = (path: string) => location.pathname === localizedPath(path, locale());
  return (
    <header class="design-header">
      <div class="design-header-inner">
        <Brand />
        <nav class="design-nav" aria-label={locale() === "en" ? "Main navigation" : "主导航"}>
          <a
            class={["design-nav-link", { active: active("/") }]}
            aria-current={active("/") ? "page" : undefined}
            href={localizedPath("/", locale())}
          >
            {copy().navHome}
          </a>
          <ToolMenu />
          <a
            class={[
              "design-nav-link",
              { active: active("/resources") || location.pathname.includes("/guides/") },
            ]}
            aria-current={active("/resources") ? "page" : undefined}
            href={localizedPath("/resources", locale())}
          >
            {copy().navBlog}
          </a>
          <a
            class={["design-nav-link", { active: active("/pricing") }]}
            aria-current={active("/pricing") ? "page" : undefined}
            href={localizedPath("/pricing", locale())}
          >
            {copy().navPricing}
          </a>
        </nav>
        <div class="design-header-actions">
          <LanguageSwitcher currentPath={location.pathname} locale={locale()} />
          <ThemeToggle />
          <span class="design-divider" aria-hidden="true" />
          <a class="design-login-link" href={localizedPath("/login", locale())}>
            {copy().login}
          </a>
          <a class="design-start-link" href={localizedPath("/register", locale())}>
            {copy().ctaStart}
            <span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
