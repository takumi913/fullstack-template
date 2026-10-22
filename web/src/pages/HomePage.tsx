import { For } from "solid-js";
import { resolveHomepageTool } from "@/content/homepage-tool";
import { catalogLanguage, catalogToolPath, toolsmithCatalog } from "@/content/toolsmith-catalog";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { siteConfig } from "@/seo/site";
import { ToolRuntime } from "@/tools/registry";
import { DotField } from "@/components/layout/DesignEffects";
import { DesignFaq } from "@/components/tools/DesignFaq";

export default function HomePage() {
  const locale = useLocale(),
    language = () => catalogLanguage(locale()),
    copy = () => toolsmithCopy(locale());
  const primary = () => resolveHomepageTool(siteConfig.homePrimaryToolSlug, undefined, locale());
  return (
    <>
      <section class="design-runner-section" data-screen-label="Tool runner">
        <DotField />
        <div class="design-runner-vignette" />
        <div class="design-runner-inner">
          {primary() && primary()!.componentKey !== "ai-text" ? (
            <header class="mb-8">
              <h1 class="page-title">{primary()!.h1}</h1>
              <p class="page-description">{primary()!.intro}</p>
              <ul class="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <For each={primary()!.features}>{(feature) => <li>{feature}</li>}</For>
              </ul>
            </header>
          ) : (
            <div class="design-home-heading">
              <h1>
                {copy().h1a} <span>{copy().h1b}</span>
              </h1>
              <span class="design-hero-trust">
                <span class="design-dot" aria-hidden="true" />
                {copy().heroSub}
              </span>
            </div>
          )}
          {primary() && <ToolRuntime page={primary()!} />}
        </div>
      </section>
      <section class="design-container design-more-tools" data-screen-label="More tools">
        <div class="design-more-tools-heading">
          <h2>{copy().toolsTitle}</h2>
          <a href={localizedPath("/tools", locale())}>{copy().viewAll} →</a>
        </div>
        <div class="design-tool-chips">
          <For each={toolsmithCatalog.slice(0, 8)}>
            {(tool) => (
              <a class="design-tool-chip" href={catalogToolPath(tool.id, locale())}>
                <span class="design-chip-glyph">{tool.g}</span>
                {tool[language()][0]}
              </a>
            )}
          </For>
        </div>
      </section>
      <DesignFaq />
    </>
  );
}
