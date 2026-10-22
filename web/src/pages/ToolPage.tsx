import { Show, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import ErrorPage from "./ErrorPage";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { useTranslation } from "@/i18n/context";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ToolContentSections } from "@/components/tools/ToolContentSections";
import { getToolPageByPath } from "@/content/tool-pages";
import { ToolRuntime } from "@/tools/registry";
import { useLocale } from "@/i18n/context";
import { localizedPath } from "@/i18n/locales";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogLanguage, catalogToolPath, toolsmithCatalog } from "@/content/toolsmith-catalog";
import { DotField } from "@/components/layout/DesignEffects";
import { trackSpot } from "@/lib/track-spot";
import { DesignFaq } from "@/components/tools/DesignFaq";
import { getLandingPagesForTool } from "@/content/landing-pages";
export default function ToolPage() {
  const location = useLocation();
  const tool = () => getToolPageByPath(location.pathname);
  return (
    <Show when={tool()} fallback={<ErrorPage notFound />}>
      {(page) => <ToolDetail tool={page()} />}
    </Show>
  );
}

function ToolDetail(props: { tool: ToolPageDefinition }) {
  const tool = () => props.tool;
  const { t } = useTranslation();
  const locale = useLocale(),
    language = () => catalogLanguage(locale()),
    copy = () => toolsmithCopy(locale());
  const catalog = () => toolsmithCatalog.find((item) => item.id === tool().runtime?.toolId)!;
  const guide = () => getLandingPagesForTool(tool().slug)[0];
  const related = () =>
    toolsmithCatalog
      .filter((item) => item.id !== catalog().id && (item.cat === catalog().cat || item.hot))
      .slice(0, 4);
  return (
    <>
      {tool().componentKey === "ai-text" ? (
        <>
          <section class="design-runner-section" data-screen-label="Tool runner">
            <DotField />
            <div class="design-runner-vignette" />
            <div class="design-runner-inner">
              <div class="design-tool-heading">
                <nav class="design-breadcrumb">
                  <a href={localizedPath("/", locale())}>{copy().crumbHome}</a>
                  <span>/</span>
                  <a href={localizedPath("/tools", locale())}>{copy().crumbTools}</a>
                  <span>/</span>
                  <span>{tool().name}</span>
                </nav>
                <div class="design-tool-title-row">
                  <span class="design-tool-icon">{catalog().g}</span>
                  <h1>{tool().h1}</h1>
                </div>
                <p>{tool().intro}</p>
              </div>
              <ToolRuntime page={tool()} />
              <div class="design-tool-trust">
                <For each={copy().trust}>
                  {(item) => (
                    <span>
                      <span class="design-small-diamond" aria-hidden="true" />
                      {item}
                    </span>
                  )}
                </For>
              </div>
            </div>
          </section>
          <section class="design-container design-how-to" data-screen-label="Tool how-to">
            <h2>{copy().howTitle}</h2>
            <div class="design-how-grid">
              <For each={copy().how}>
                {(step) => (
                  <div class="design-how-step">
                    <div class="design-how-number">0{step.n}</div>
                    <div class="design-how-title">
                      {guide() && step.n === 3 ? <a href={guide()!.path}>{step.t}</a> : step.t}
                    </div>
                    <div class="design-how-description">{step.d}</div>
                  </div>
                )}
              </For>
            </div>
          </section>
          <section class="design-container design-related" data-screen-label="Related tools">
            <h2>{copy().relatedTitle}</h2>
            <div class="design-related-grid">
              <For each={related()}>
                {(item) => (
                  <a
                    class="design-related-card"
                    href={catalogToolPath(item.id, locale())}
                    onMouseMove={trackSpot}
                  >
                    <span class="design-related-glyph">{item.g}</span>
                    <span class="design-related-name">{item[language()][0]}</span>
                    <span class="text-muted-foreground">→</span>
                  </a>
                )}
              </For>
            </div>
          </section>
          <DesignFaq />
        </>
      ) : (
        <>
          <section class="runner-section">
            <div class="shell runner-shell">
              <Breadcrumbs tool={tool()} />
              <header class="mt-7">
                <div class="flex items-center gap-4">
                  <span class="tool-glyph large" aria-hidden="true">
                    {tool().componentKey === "json-formatter" ? "{}" : "Aa"}
                  </span>
                  <h1 class="page-title !mt-0">{tool().h1}</h1>
                </div>
                <p class="page-description">{tool().intro}</p>
              </header>
              <section class="mt-8" aria-label={tool().name}>
                <ToolRuntime page={tool()} />
              </section>
              <p class="trust-note mt-5 flex justify-center">
                <span class="status-dot active" aria-hidden="true" />
                {t("workbench.local")}
              </p>
            </div>
          </section>
          <div class="shell pb-16">
            <ToolContentSections tool={tool()} />
          </div>
        </>
      )}
    </>
  );
}
