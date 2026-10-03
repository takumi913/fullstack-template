import { Link } from "react-router";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogToolPath } from "@/content/toolsmith-catalog";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";

export function ResearchGuidePage() {
  const locale = useLocale(),
    copy = toolsmithCopy(locale);
  const sections = ["intro", "steps", "comparison", "comparison"];
  const summarizer = catalogToolPath("summarizer", locale);
  return (
    <section className="design-container design-guide" data-screen-label="Guide">
      <nav className="design-breadcrumb">
        <Link to={localizedPath("/", locale)}>{copy.crumbHome}</Link>
        <span>/</span>
        <Link to={localizedPath("/resources", locale)}>{copy.navBlog}</Link>
        <span>/</span>
        <span>{copy.guideCrumb}</span>
      </nav>
      <h1 className="design-guide-title">{copy.guideTitle}</h1>
      <div className="design-guide-meta">{copy.guideMeta}</div>
      <div className="design-guide-grid">
        <article className="design-guide-article">
          <p id="intro" className="design-guide-intro">
            {copy.guideIntro}
          </p>
          <h2 id="steps">{copy.gStepsTitle}</h2>
          <div className="design-guide-steps">
            {copy.gSteps.map((step) => (
              <div className="design-guide-step" key={step.n}>
                <span className="design-guide-number">{step.n}</span>
                <div>
                  <div className="design-guide-step-title">{step.t}</div>
                  <div className="design-guide-step-copy">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="design-guide-tip">
            <div>
              <div className="design-guide-tip-title">{copy.tipTitle}</div>
              <div className="design-guide-tip-copy">{copy.tipBody}</div>
            </div>
            <Link className="design-button primary" to={summarizer}>
              {copy.tryNow} →
            </Link>
          </div>
          <h2 id="comparison">{copy.cmpTitle}</h2>
          <div className="design-comparison">
            <div className="design-comparison-grid">
              {copy.cmp.flatMap((row, rowIndex) =>
                row.map((value, index) => (
                  <div
                    className={`design-comparison-cell ${rowIndex === 0 ? "heading" : ""} ${index === 0 ? "row-label" : ""} ${index === 1 ? "featured" : ""}`}
                    key={`${rowIndex}-${index}`}
                  >
                    {value}
                  </div>
                )),
              )}
            </div>
          </div>
        </article>
        <aside className="design-guide-aside">
          <div className="design-guide-toc">
            <div className="design-guide-toc-title">{copy.tocTitle}</div>
            <nav className="design-guide-toc-links">
              {copy.toc.map((title, index) => (
                <a key={title} href={`#${sections[index]}`}>
                  {title}
                </a>
              ))}
            </nav>
          </div>
          <div className="design-guide-side-cta">
            <div className="design-guide-side-cta-title">{copy.sideCtaTitle}</div>
            <div className="design-guide-side-cta-copy">{copy.sideCtaBody}</div>
            <Link className="design-button" to={summarizer}>
              {copy.tryNow} →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
