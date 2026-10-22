import { localizedPath, normalizeLocale } from "@/i18n/locales";
import { Show, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import ErrorPage from "./ErrorPage";
import type { LandingPageDefinition } from "@/content/landing-pages";
import { getLandingPageByPath } from "@/content/landing-pages";
import { getToolPageBySlug, toolPath } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";
import { ResearchGuidePage } from "./ResearchGuidePage";

export default function LandingPage() {
  const location = useLocation();
  const page = () => getLandingPageByPath(location.pathname);
  return (
    <Show when={page()} fallback={<ErrorPage notFound />}>
      {(page) => <LandingContent page={page()} />}
    </Show>
  );
}

function LandingContent(props: { page: LandingPageDefinition }) {
  const page = () => props.page;
  const copy = () => publicPageCopy(page().locale);
  const locale = () => normalizeLocale(page().locale);
  const relatedTools = () =>
    page()
      .relatedToolSlugs.map((slug) => getToolPageBySlug(slug))
      .filter((tool) => tool !== undefined);
  return (
    <>
      {page().translationKey === "read-paper" ? (
        <ResearchGuidePage />
      ) : (
        <article class="shell page-shell">
          <nav aria-label={copy().breadcrumb} class="text-sm text-muted-foreground">
            <ol class="flex flex-wrap items-center gap-2">
              <li>
                <a class="text-link" href={localizedPath("/", locale())}>
                  {copy().home}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a class="text-link" href={localizedPath("/resources", locale())}>
                  {copy().resources}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" class="text-foreground">
                {copy().kinds[page().kind]}
              </li>
            </ol>
          </nav>
          <header class="mt-7 max-w-4xl">
            <p class="eyebrow">{copy().kinds[page().kind]}</p>
            <h1 class="page-title">{page().h1}</h1>
            <p class="page-description">{page().intro}</p>
            <time
              class="mt-5 block font-mono text-xs text-muted-foreground"
              datetime={page().updatedAt}
            >
              {page().updatedAt}
            </time>
          </header>
          <div class="article-layout">
            <div class="space-y-12">
              <For each={page().sections}>
                {(section, index) => (
                  <section id={`section-${index() + 1}`}>
                    <h2 class="text-2xl font-semibold tracking-tight">{section.heading}</h2>
                    <p class="mt-4 text-base leading-8 text-muted-foreground">{section.body}</p>
                  </section>
                )}
              </For>
            </div>
            <aside class="article-toc panel">
              <p class="eyebrow">{copy().onThisPage}</p>
              <nav class="mt-4 flex flex-col gap-3" aria-label={copy().onThisPage}>
                <For each={page().sections}>
                  {(section, index) => (
                    <a class="text-link text-muted-foreground" href={`#section-${index() + 1}`}>
                      {section.heading}
                    </a>
                  )}
                </For>
              </nav>
              {relatedTools()[0] && (
                <div class="mt-6 border-t pt-6">
                  <span class="tool-glyph">
                    {relatedTools()[0].componentKey === "json-formatter" ? "{}" : "Aa"}
                  </span>
                  <p class="mt-4 font-semibold">{relatedTools()[0].name}</p>
                  <a class="button-primary mt-4 w-full" href={toolPath(relatedTools()[0])}>
                    {copy().tryTool}
                  </a>
                </div>
              )}
            </aside>
          </div>
          {relatedTools().length > 0 && (
            <section class="content-section">
              <h2 class="section-title">{copy().relatedTools}</h2>
              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <For each={relatedTools()}>
                  {(tool) => (
                    <a class="spotlight-card flex items-start gap-4 p-6" href={toolPath(tool)}>
                      <span class="tool-glyph">
                        {tool.componentKey === "json-formatter" ? "{}" : "Aa"}
                      </span>
                      <div>
                        <h3 class="font-semibold">{tool.name}</h3>
                        <p class="mt-2 text-sm leading-7 text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </a>
                  )}
                </For>
              </div>
            </section>
          )}
          {page().faq.length > 0 && (
            <section class="faq-section">
              <div>
                <p class="eyebrow">FAQ</p>
                <h2 class="section-title">{copy().faq}</h2>
              </div>
              <div class="faq-items">
                <For each={page().faq}>
                  {(item) => (
                    <details class="faq-item">
                      <summary>{item.question}</summary>
                      <p>{item.answer}</p>
                    </details>
                  )}
                </For>
              </div>
            </section>
          )}
        </article>
      )}
    </>
  );
}
