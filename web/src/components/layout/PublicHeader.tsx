import { Link, NavLink, useLocation, useMatches } from "react-router";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import type { SeoAlternate } from "@/seo/localization";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { ToolMenu } from "@/components/tools/ToolMenu";

export function PublicHeader() {
  const locale = useLocale(),
    copy = toolsmithCopy(locale);
  const { pathname } = useLocation();
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as
    { languageAlternates?: (path: string) => SeoAlternate[] } | undefined;
  const alternates = handle?.languageAlternates?.(pathname);
  return (
    <header className="design-header">
      <div className="design-header-inner">
        <Brand />
        <nav className="design-nav" aria-label={locale === "en" ? "Main navigation" : "主导航"}>
          <NavLink end className="design-nav-link" to={localizedPath("/", locale)}>
            {copy.navHome}
          </NavLink>
          <ToolMenu />
          <NavLink
            className={({ isActive }) =>
              `design-nav-link ${isActive || pathname.includes("/guides/") ? "active" : ""}`
            }
            to={localizedPath("/resources", locale)}
          >
            {copy.navBlog}
          </NavLink>
          <NavLink className="design-nav-link" to={localizedPath("/pricing", locale)}>
            {copy.navPricing}
          </NavLink>
        </nav>
        <div className="design-header-actions">
          <LanguageSwitcher alternates={alternates} currentPath={pathname} locale={locale} />
          <ThemeToggle />
          <span className="design-divider" aria-hidden="true" />
          <Link className="design-login-link" to={localizedPath("/login", locale)}>
            {copy.login}
          </Link>
          <Link className="design-start-link" to={localizedPath("/register", locale)}>
            {copy.ctaStart}
            <span>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
