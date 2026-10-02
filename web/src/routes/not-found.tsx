import { useTranslation } from "react-i18next";
import { useLocale } from "@/i18n/useLocale";
import { localizedPath } from "@/i18n/locales";
import { Link } from "react-router";
import { notFoundPageMeta } from "@/seo/page";

export const meta = () => notFoundPageMeta("404 - Page not found");

export default function NotFoundRoute() {
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <main className="shell grid min-h-[60vh] place-items-center border-x px-6 py-20 text-center">
      <div>
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
          {t("error.notFound")}
        </h1>
        <p className="mt-3 text-sm text-zinc-500">{t("error.missing")}</p>
        <Link className="button-primary mt-6 inline-flex" to={localizedPath("/", locale)}>
          {t("error.home")}
        </Link>
      </div>
    </main>
  );
}
