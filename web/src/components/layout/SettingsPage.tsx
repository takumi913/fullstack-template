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
          <h1 className="page-title !mt-0 !text-4xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-4 text-sm">
          <Link
            className="text-muted-foreground hover:text-foreground"
            to={localizedPath("/dashboard", locale)}
          >
            {t("common:navigation.dashboard")}
          </Link>
          <Link
            className="text-muted-foreground hover:text-foreground"
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
