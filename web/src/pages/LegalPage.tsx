import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { legalPages, type LegalPageKind } from "@/content/legal-pages";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const locale = useLocale();
  const { t } = useTranslation();
  const page = legalPages[locale][kind];
  return (
    <article className="shell page-shell">
      <header className="max-w-3xl">
        <h1 className="page-title !mt-0">{page.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{page.description}</p>
        {page.status === "draft" && (
          <p className="panel mt-6 p-4 text-sm leading-6 text-muted-foreground">{page.notice}</p>
        )}
        {page.updatedAt && (
          <time className="mt-4 block text-sm text-muted-foreground" dateTime={page.updatedAt}>
            {page.updatedAt}
          </time>
        )}
      </header>
      <div className="mt-10 max-w-3xl space-y-10 text-base leading-8 text-muted-foreground">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-medium text-foreground">{section.heading}</h2>
            <p className="mt-3">{section.body}</p>
          </section>
        ))}
      </div>
      <nav className="mt-10 flex gap-6 border-t pt-6 text-sm" aria-label={t("navigation.footer")}>
        <Link to={localizedPath("/legal/privacy-policy", locale)}>{t("navigation.privacy")}</Link>
        <Link to={localizedPath("/legal/terms", locale)}>{t("navigation.terms")}</Link>
      </nav>
    </article>
  );
}
