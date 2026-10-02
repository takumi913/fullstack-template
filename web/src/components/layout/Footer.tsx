import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { siteConfig } from "@/seo/site";

export function Footer() {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <footer className="border-t bg-white">
      <div className="shell flex flex-col gap-5 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{siteConfig.name}</span>
        <nav aria-label={t("navigation.footer")} className="flex flex-wrap gap-x-5 gap-y-2">
          <Link
            className="inline-flex min-h-11 items-center hover:text-zinc-950"
            to={localizedPath("/tools", locale)}
          >
            {t("tools")}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center hover:text-zinc-950"
            to={localizedPath("/resources", locale)}
          >
            {t("resources")}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center hover:text-zinc-950"
            to={localizedPath("/legal/privacy-policy", locale)}
          >
            {t("navigation.privacy")}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center hover:text-zinc-950"
            to={localizedPath("/legal/terms", locale)}
          >
            {t("navigation.terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
