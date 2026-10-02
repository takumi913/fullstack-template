import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
export function SettingsPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation(["app", "common"]);
  const locale = useLocale();
  return (
    <div className="shell py-12 sm:py-16">
      <div className="mb-9 flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">{title}</h1>
          {description && <p className="mt-2 text-sm text-zinc-500">{description}</p>}
        </div>
        <div className="flex gap-4 text-sm">
          <Link
            className="text-zinc-500 hover:text-zinc-950"
            to={localizedPath("/dashboard", locale)}
          >
            {t("common:navigation.dashboard")}
          </Link>
          <Link
            className="text-zinc-500 hover:text-zinc-950"
            to={localizedPath("/settings/security", locale)}
          >
            {t("security.link")}
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
