import { useTranslation } from "react-i18next";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { Link, useRouteError } from "react-router";

// 路由级错误边界。没有它时，任何渲染期抛错都会让页面变成一片空白。
export default function ErrorPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : String(error ?? "");

  return (
    <div className="grid min-h-[calc(100vh-113px)] place-items-center px-5 py-16">
      <div className="w-full max-w-[440px] text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-zinc-950">
          {t("error.title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">{t("error.description")}</p>
        {detail && (
          <p className="mt-4 break-words rounded border bg-zinc-50 p-3 text-left text-xs text-zinc-600">
            {detail}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <button className="button-primary" onClick={() => window.location.reload()}>
            {t("error.reload")}
          </button>
          <Link
            className="self-center text-zinc-500 hover:text-zinc-950"
            to={localizedPath("/", locale)}
          >
            {t("error.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
