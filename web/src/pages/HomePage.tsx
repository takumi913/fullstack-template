import { Link } from "react-router";
import { resolveHomepageTool } from "@/content/homepage-tool";
import { catalogLanguage, catalogToolPath, toolsmithCatalog } from "@/content/toolsmith-catalog";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { siteConfig } from "@/seo/site";
import { ToolRuntime } from "@/tools/registry";
import { DotField } from "@/components/layout/DesignEffects";
import { DesignFaq } from "@/components/tools/DesignFaq";

export default function HomePage() {
  const locale = useLocale(),
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const primary = resolveHomepageTool(siteConfig.homePrimaryToolSlug, undefined, locale);
  return (
    <>
      <section className="design-runner-section" data-screen-label="Tool runner">
        <DotField />
        <div className="design-runner-vignette" />
        <div className="design-runner-inner">
          {primary && primary.componentKey !== "ai-text" ? (
            <header className="mb-8">
              <h1 className="page-title">{primary.h1}</h1>
              <p className="page-description">{primary.intro}</p>
              <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {primary.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </header>
          ) : (
            <div className="design-home-heading">
              <h1>
                {copy.h1a} <span>{copy.h1b}</span>
              </h1>
              <span className="design-hero-trust">
                <span className="design-dot" aria-hidden="true" />
                {copy.heroSub}
              </span>
            </div>
          )}
          {primary && <ToolRuntime key={primary.slug} page={primary} />}
        </div>
      </section>
      <section className="design-container design-more-tools" data-screen-label="More tools">
        <div className="design-more-tools-heading">
          <h2>{copy.toolsTitle}</h2>
          <Link to={localizedPath("/tools", locale)}>{copy.viewAll} →</Link>
        </div>
        <div className="design-tool-chips">
          {toolsmithCatalog.slice(0, 8).map((tool) => (
            <Link className="design-tool-chip" key={tool.id} to={catalogToolPath(tool.id, locale)}>
              <span className="design-chip-glyph">{tool.g}</span>
              {tool[language][0]}
            </Link>
          ))}
        </div>
      </section>
      <DesignFaq />
    </>
  );
}
