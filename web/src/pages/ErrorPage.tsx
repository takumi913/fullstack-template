import { httpStatus } from "@solidjs/web";
import { useTranslation } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";

// 路由级错误边界。没有它时，任何渲染期抛错都会让页面变成一片空白。
export default function ErrorPage(props: { error?: unknown; notFound?: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const detail = () =>
    props.error instanceof Error ? props.error.message : String(props.error ?? "");

  return (
    <>
      {props.notFound && <MissingDocumentStatus />}
      <div class="grid min-h-[calc(100vh-113px)] place-items-center px-5 py-16">
        <div class="w-full max-w-[440px] text-center">
          <h1 class="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            {t(props.notFound ? "error.notFound" : "error.title")}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">
            {t(props.notFound ? "error.missing" : "error.description")}
          </p>
          {detail() && (
            <p class="mt-4 break-words rounded border bg-card p-3 text-left text-xs text-muted-foreground">
              {detail()}
            </p>
          )}
          <div class="mt-6 flex justify-center gap-4 text-sm">
            <button class="button-primary" onClick={() => window.location.reload()}>
              {t("error.reload")}
            </button>
            <a
              class="self-center text-muted-foreground hover:text-foreground"
              href={localizedPath("/", locale())}
            >
              {t("error.home")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function MissingDocumentStatus() {
  httpStatus(404);
  return null;
}
