import { localizedPath, normalizeLocale } from "@/i18n/locales";
import { Link, Navigate, useLocation } from "react-router";
import { getLandingPageByPath } from "@/content/landing-pages";
import { getToolPageBySlug, toolPath } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";
import { ResearchGuidePage } from "./ResearchGuidePage";

export default function LandingPage() {
  const { pathname } = useLocation();
  const page = getLandingPageByPath(pathname);
  if (!page) return <Navigate replace to="/404" />;
  if (page.translationKey === "read-paper") return <ResearchGuidePage />;
  const copy = publicPageCopy(page.locale);
  const locale = normalizeLocale(page.locale);
  const relatedTools = page.relatedToolSlugs
    .map((slug) => getToolPageBySlug(slug))
    .filter((tool) => tool !== undefined);
  return (
    <article className="shell page-shell">
      <nav aria-label={copy.breadcrumb} className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="text-link" to={localizedPath("/", locale)}>
              {copy.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="text-link" to={localizedPath("/resources", locale)}>
              {copy.resources}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {copy.kinds[page.kind]}
          </li>
        </ol>
      </nav>
      <header className="mt-7 max-w-4xl">
        <p className="eyebrow">{copy.kinds[page.kind]}</p>
        <h1 className="page-title">{page.h1}</h1>
        <p className="page-description">{page.intro}</p>
        <time
          className="mt-5 block font-mono text-xs text-muted-foreground"
          dateTime={page.updatedAt}
        >
          {page.updatedAt}
        </time>
      </header>
      <div className="article-layout">
        <div className="space-y-12">
          {page.sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
        <aside className="article-toc panel">
          <p className="eyebrow">{copy.onThisPage}</p>
          <nav className="mt-4 flex flex-col gap-3" aria-label={copy.onThisPage}>
            {page.sections.map((section, index) => (
              <a
                className="text-link text-muted-foreground"
                href={`#section-${index + 1}`}
                key={section.heading}
              >
                {section.heading}
              </a>
            ))}
          </nav>
          {relatedTools[0] && (
            <div className="mt-6 border-t pt-6">
              <span className="tool-glyph">
                {relatedTools[0].componentKey === "json-formatter" ? "{}" : "Aa"}
              </span>
              <p className="mt-4 font-semibold">{relatedTools[0].name}</p>
              <Link className="button-primary mt-4 w-full" to={toolPath(relatedTools[0])}>
                {copy.tryTool}
              </Link>
            </div>
          )}
        </aside>
      </div>
      {relatedTools.length > 0 && (
        <section className="content-section">
          <h2 className="section-title">{copy.relatedTools}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {relatedTools.map((tool) => (
              <Link
                className="spotlight-card flex items-start gap-4 p-6"
                key={tool.slug}
                to={toolPath(tool)}
              >
                <span className="tool-glyph">
                  {tool.componentKey === "json-formatter" ? "{}" : "Aa"}
                </span>
                <div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {page.faq.length > 0 && (
        <section className="faq-section">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="section-title">{copy.faq}</h2>
          </div>
          <div className="faq-items">
            {page.faq.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
