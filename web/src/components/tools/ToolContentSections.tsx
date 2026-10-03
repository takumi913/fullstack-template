import { Check } from "lucide-react";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { RelatedResources } from "@/components/seo/RelatedResources";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { publicPageCopy } from "@/seo/ui-copy";

export function ToolContentSections({
  tool,
  surface = "page",
}: {
  tool: ToolPageDefinition;
  surface?: "page" | "home";
}) {
  const copy = publicPageCopy(tool.locale);
  return (
    <div className={surface === "home" ? "home-tool-content" : "pb-8"}>
      <section className="content-section">
        <h2 className="text-lg font-semibold">{copy.whatThisToolDoes}</h2>
        <ul className="mt-5 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          {tool.features.map((feature) => (
            <li className="flex items-start gap-3 leading-6" key={feature}>
              <Check size={15} className="mt-1 shrink-0 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="content-section">
        <p className="eyebrow">01 — 02 — 03</p>
        <h2 className="section-title">{copy.howToUse}</h2>
        <ol className="steps-grid">
          {tool.howToSteps.map((step, index) => (
            <li className="step-card" key={step}>
              <span className="step-number">0{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
      {tool.faq.length > 0 && (
        <section className="faq-section">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="section-title">{copy.faq}</h2>
          </div>
          <div className="faq-items">
            {tool.faq.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <div className="space-y-12 pt-16">
        <RelatedResources tool={tool} />
        <RelatedTools tool={tool} />
      </div>
    </div>
  );
}
