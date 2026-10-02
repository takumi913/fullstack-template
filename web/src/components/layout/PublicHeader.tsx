import { Link, useLocation, useMatches } from "react-router";
import { templateSiteConfig } from "@/config/site-config";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import type { SeoAlternate } from "@/seo/localization";
import { siteConfig } from "@/seo/site";

export function PublicHeader() {
  const locale = useLocale();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const matches = useMatches();
  const handle = matches[matches.length - 1]?.handle as
    { languageAlternates?: (path: string) => SeoAlternate[] } | undefined;
  const alternates = handle?.languageAlternates?.(pathname);
  return (
    <header className="border-b bg-white">
      <div className="shell flex min-h-14 items-center justify-between gap-4 py-2">
        <Link
          to={localizedPath("/", locale)}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-[-0.01em]"
        >
          <span className="grid size-5 place-items-center rounded-[4px] bg-zinc-900 text-[10px] text-white">
            {siteConfig.mark}
          </span>
          {siteConfig.shortName}
        </Link>

        <nav
          aria-label={t("navigation.primary")}
          className="flex flex-wrap items-center justify-end gap-1"
        >
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to={localizedPath("/tools", locale)}
          >
            {t("tools")}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to={localizedPath("/resources", locale)}
          >
            {t("resources")}
          </Link>
          {templateSiteConfig.navigation.showAuthLinks ? (
            <>
              <Link
                className="inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                to={localizedPath("/login", locale)}
              >
                {t("navigation.login")}
              </Link>
              <Link className="button-primary px-3" to={localizedPath("/register", locale)}>
                {t("navigation.register")}
              </Link>
            </>
          ) : null}
          <LanguageSwitcher alternates={alternates} currentPath={pathname} locale={locale} />
        </nav>
      </div>
    </header>
  );
}
