import { Link, Navigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ToolContentSections } from "@/components/tools/ToolContentSections";
import { getToolPageByPath } from "@/content/tool-pages";
import { ToolRuntime } from "@/tools/registry";
import { useLocale } from "@/i18n/useLocale";
import { localizedPath } from "@/i18n/locales";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogLanguage, catalogToolPath, toolsmithCatalog } from "@/content/toolsmith-catalog";
import { DotField } from "@/components/layout/DesignEffects";
import { trackSpot } from "@/lib/track-spot";
import { DesignFaq } from "@/components/tools/DesignFaq";
import { getLandingPagesForTool } from "@/content/landing-pages";
export default function ToolPage() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const locale = useLocale(),
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const tool = getToolPageByPath(pathname);
  if (!tool) return <Navigate replace to="/404" />;
  if (tool.componentKey === "ai-text") {
    const catalog = toolsmithCatalog.find((item) => item.id === tool.runtime?.toolId)!;
    const guide = getLandingPagesForTool(tool.slug)[0];
    const related = toolsmithCatalog
      .filter((item) => item.id !== catalog.id && (item.cat === catalog.cat || item.hot))
      .slice(0, 4);
    return (
      <>
        <section className="design-runner-section" data-screen-label="Tool runner">
          <DotField />
          <div className="design-runner-vignette" />
          <div className="design-runner-inner">
            <div className="design-tool-heading">
              <nav className="design-breadcrumb">
                <Link to={localizedPath("/", locale)}>{copy.crumbHome}</Link>
                <span>/</span>
                <Link to={localizedPath("/tools", locale)}>{copy.crumbTools}</Link>
                <span>/</span>
                <span>{tool.name}</span>
              </nav>
              <div className="design-tool-title-row">
                <span className="design-tool-icon">{catalog.g}</span>
                <h1>{tool.h1}</h1>
              </div>
              <p>{tool.intro}</p>
            </div>
            <ToolRuntime key={tool.slug} page={tool} />
            <div className="design-tool-trust">
              {copy.trust.map((item) => (
                <span key={item}>
                  <span className="design-small-diamond" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
        <section className="design-container design-how-to" data-screen-label="Tool how-to">
          <h2>{copy.howTitle}</h2>
          <div className="design-how-grid">
            {copy.how.map((step) => (
              <div className="design-how-step" key={step.n}>
                <div className="design-how-number">0{step.n}</div>
                <div className="design-how-title">
                  {guide && step.n === 3 ? <Link to={guide.path}>{step.t}</Link> : step.t}
                </div>
                <div className="design-how-description">{step.d}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="design-container design-related" data-screen-label="Related tools">
          <h2>{copy.relatedTitle}</h2>
          <div className="design-related-grid">
            {related.map((item) => (
              <Link
                className="design-related-card"
                key={item.id}
                to={catalogToolPath(item.id, locale)}
                onMouseMove={trackSpot}
              >
                <span className="design-related-glyph">{item.g}</span>
                <span className="design-related-name">{item[language][0]}</span>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        </section>
        <DesignFaq />
      </>
    );
  }
  return (
    <>
      <section className="runner-section">
        <div className="shell runner-shell">
          <Breadcrumbs tool={tool} />
          <header className="mt-7">
            <div className="flex items-center gap-4">
              <span className="tool-glyph large" aria-hidden="true">
                {tool.componentKey === "json-formatter" ? "{}" : "Aa"}
              </span>
              <h1 className="page-title !mt-0">{tool.h1}</h1>
            </div>
            <p className="page-description">{tool.intro}</p>
          </header>
          <section className="mt-8" aria-label={tool.name}>
            <ToolRuntime page={tool} />
          </section>
          <p className="trust-note mt-5 flex justify-center">
            <span className="status-dot active" aria-hidden="true" />
            {t("workbench.local")}
          </p>
        </div>
      </section>
      <div className="shell pb-16">
        <ToolContentSections tool={tool} />
      </div>
    </>
  );
}
