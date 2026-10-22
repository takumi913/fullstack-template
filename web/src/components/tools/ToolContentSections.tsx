import { For } from "solid-js";
import { Check } from "@lucide/solid";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { RelatedResources } from "@/components/seo/RelatedResources";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { publicPageCopy } from "@/seo/ui-copy";

export function ToolContentSections(props: {
  tool: ToolPageDefinition;
  surface?: "page" | "home";
}) {
  const copy = () => publicPageCopy(props.tool.locale);
  return (
    <div class={props.surface === "home" ? "home-tool-content" : "pb-8"}>
      <section class="content-section">
        <h2 class="text-lg font-semibold">{copy().whatThisToolDoes}</h2>
        <ul class="mt-5 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <For each={props.tool.features}>
            {(feature) => (
              <li class="flex items-start gap-3 leading-6">
                <Check size={15} class="mt-1 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            )}
          </For>
        </ul>
      </section>
      <section class="content-section">
        <p class="eyebrow">01 — 02 — 03</p>
        <h2 class="section-title">{copy().howToUse}</h2>
        <ol class="steps-grid">
          <For each={props.tool.howToSteps}>
            {(step, index) => (
              <li class="step-card">
                <span class="step-number">0{index() + 1}</span>
                <p>{step}</p>
              </li>
            )}
          </For>
        </ol>
      </section>
      {props.tool.faq.length > 0 && (
        <section class="faq-section">
          <div>
            <p class="eyebrow">FAQ</p>
            <h2 class="section-title">{copy().faq}</h2>
          </div>
          <div class="faq-items">
            <For each={props.tool.faq}>
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
      <div class="space-y-12 pt-16">
        <RelatedResources tool={props.tool} />
        <RelatedTools tool={props.tool} />
      </div>
    </div>
  );
}
