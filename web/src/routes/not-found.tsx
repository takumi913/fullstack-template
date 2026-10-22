import { httpStatus } from "@solidjs/web";
import { useTranslation, useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { notFoundPageMeta, withPageMeta } from "@/seo/page";

export const meta = () => notFoundPageMeta("404 - Page not found");

function NotFoundRoute() {
  httpStatus(404);
  const { t } = useTranslation();
  const locale = useLocale();
  return (
    <section class="shell grid min-h-[60vh] place-items-center px-6 py-20 text-center">
      <div>
        <p class="text-sm font-medium text-muted-foreground">404</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
          {t("error.notFound")}
        </h1>
        <p class="mt-3 text-sm text-muted-foreground">{t("error.missing")}</p>
        <a class="button-primary mt-6 inline-flex" href={localizedPath("/", locale())}>
          {t("error.home")}
        </a>
      </div>
    </section>
  );
}

export default withPageMeta(NotFoundRoute, meta);
