import { For } from "solid-js";
import { useTranslation } from "@/i18n/context";
import { legalPages, type LegalPageKind } from "@/content/legal-pages";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";

export function LegalPage(props: { kind: LegalPageKind }) {
  const locale = useLocale();
  const { t } = useTranslation();
  const page = () => legalPages[locale()][props.kind];
  return (
    <article class="shell page-shell">
      <header class="max-w-3xl">
        <h1 class="page-title !mt-0">{page().title}</h1>
        <p class="mt-4 text-base leading-7 text-muted-foreground">{page().description}</p>
        {page().status === "draft" && (
          <p class="panel mt-6 p-4 text-sm leading-6 text-muted-foreground">{page().notice}</p>
        )}
        {page().updatedAt && (
          <time class="mt-4 block text-sm text-muted-foreground" datetime={page().updatedAt}>
            {page().updatedAt}
          </time>
        )}
      </header>
      <div class="mt-10 max-w-3xl space-y-10 text-base leading-8 text-muted-foreground">
        <For each={page().sections}>
          {(section) => (
            <section>
              <h2 class="text-xl font-medium text-foreground">{section.heading}</h2>
              <p class="mt-3">{section.body}</p>
            </section>
          )}
        </For>
      </div>
      <nav class="mt-10 flex gap-6 border-t pt-6 text-sm" aria-label={t("navigation.footer")}>
        <a href={localizedPath("/legal/privacy-policy", locale())}>{t("navigation.privacy")}</a>
        <a href={localizedPath("/legal/terms", locale())}>{t("navigation.terms")}</a>
      </nav>
    </article>
  );
}
