import { Link, useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { localizedPath, supportedLocales } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { siteConfig } from "@/seo/site";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { pathname } = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="shell flex min-h-14 items-center justify-between gap-4 py-2">
        <Link
          to={localizedPath("/", locale)}
          className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]"
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
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to={localizedPath("/dashboard", locale)}
          >
            {t("navigation.dashboard")}
          </Link>
          <button
            className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            onClick={() => {
              logout()
                .catch(() => {})
                .finally(() => navigate(localizedPath("/", locale)));
            }}
            type="button"
          >
            {t("navigation.logout")}
          </button>
          <LanguageSwitcher
            alternates={supportedLocales.map((language) => ({
              hreflang: language,
              path: localizedPath(pathname, language),
            }))}
            currentPath={pathname}
            locale={locale}
          />
        </nav>
      </div>
    </header>
  );
}
