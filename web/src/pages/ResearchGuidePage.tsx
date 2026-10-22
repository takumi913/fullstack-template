import { For } from "solid-js";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogToolPath } from "@/content/toolsmith-catalog";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";

export function ResearchGuidePage() {
  const locale = useLocale(),
    copy = () => toolsmithCopy(locale());
  const sections = ["intro", "steps", "comparison", "comparison"];
  const summarizer = () => catalogToolPath("summarizer", locale());
  return (
    <section class="design-container design-guide" data-screen-label="Guide">
      <nav class="design-breadcrumb">
        <a href={localizedPath("/", locale())}>{copy().crumbHome}</a>
        <span>/</span>
        <a href={localizedPath("/resources", locale())}>{copy().navBlog}</a>
        <span>/</span>
        <span>{copy().guideCrumb}</span>
      </nav>
      <h1 class="design-guide-title">{copy().guideTitle}</h1>
      <div class="design-guide-meta">{copy().guideMeta}</div>
      <div class="design-guide-grid">
        <article class="design-guide-article">
          <p id="intro" class="design-guide-intro">
            {copy().guideIntro}
          </p>
          <h2 id="steps">{copy().gStepsTitle}</h2>
          <div class="design-guide-steps">
            <For each={copy().gSteps}>
              {(step) => (
                <div class="design-guide-step">
                  <span class="design-guide-number">{step.n}</span>
                  <div>
                    <div class="design-guide-step-title">{step.t}</div>
                    <div class="design-guide-step-copy">{step.d}</div>
                  </div>
                </div>
              )}
            </For>
          </div>
          <div class="design-guide-tip">
            <div>
              <div class="design-guide-tip-title">{copy().tipTitle}</div>
              <div class="design-guide-tip-copy">{copy().tipBody}</div>
            </div>
            <a class="design-button primary" href={summarizer()}>
              {copy().tryNow} →
            </a>
          </div>
          <h2 id="comparison">{copy().cmpTitle}</h2>
          <div class="design-comparison">
            <div class="design-comparison-grid">
              {copy().cmp.flatMap((row, rowIndex) =>
                row.map((value, index) => (
                  <div
                    class={[
                      "design-comparison-cell",
                      { heading: rowIndex === 0, "row-label": index === 0, featured: index === 1 },
                    ]}
                  >
                    {value}
                  </div>
                )),
              )}
            </div>
          </div>
        </article>
        <aside class="design-guide-aside">
          <div class="design-guide-toc">
            <div class="design-guide-toc-title">{copy().tocTitle}</div>
            <nav class="design-guide-toc-links">
              <For each={copy().toc}>
                {(title, index) => <a href={`#${sections[index()]}`}>{title}</a>}
              </For>
            </nav>
          </div>
          <div class="design-guide-side-cta">
            <div class="design-guide-side-cta-title">{copy().sideCtaTitle}</div>
            <div class="design-guide-side-cta-copy">{copy().sideCtaBody}</div>
            <a class="design-button" href={summarizer()}>
              {copy().tryNow} →
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
