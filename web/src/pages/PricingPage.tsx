import { createSignal, For } from "solid-js";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { trackSpot } from "@/lib/track-spot";
import { DesignFaq } from "@/components/tools/DesignFaq";

export default function PricingPage() {
  const locale = useLocale(),
    copy = () => toolsmithCopy(locale());
  const [yearly, setYearly] = createSignal(false);
  const prices = () => (locale() === "en" ? [0, 5] : [0, 29]),
    currency = () => (locale() === "en" ? "$" : "¥");
  return (
    <>
      <section class="design-container design-pricing" data-screen-label="Pricing">
        <div class="design-pricing-heading">
          <div class="design-eyebrow">{copy().priceEyebrow}</div>
          <h1 class="design-page-title">{copy().priceTitle}</h1>
          <p class="design-page-subtitle">{copy().priceSub}</p>
          <button
            type="button"
            class="design-billing"
            aria-label={`${copy().monthly} / ${copy().yearly}`}
            aria-pressed={yearly() ? "true" : "false"}
            onClick={() => setYearly(!yearly())}
          >
            <span class={["design-billing-tab", { active: !yearly() }]}>{copy().monthly}</span>
            <span class={["design-billing-tab", { active: yearly() }]}>
              {copy().yearly}
              <span class="design-billing-discount">-20%</span>
            </span>
          </button>
        </div>
        <div class="design-plan-grid">
          <For each={copy().plans}>
            {(plan, index) => (
              <div class={["design-plan", { featured: index() === 1 }]} onMouseMove={trackSpot}>
                <div class="design-card-top">
                  <span class="design-plan-name">{plan.name}</span>
                  {index() === 1 && <span class="design-popular-label">{copy().popular}</span>}
                </div>
                <div class="design-plan-description">{plan.desc}</div>
                <div class="design-plan-price-row">
                  <span class="design-plan-price">
                    {currency()}
                    {yearly() ? Math.round(prices()[index()] * 0.8) : prices()[index()]}
                  </span>
                  <span class="design-plan-unit">{copy().perMonth}</span>
                </div>
                <a class="design-plan-button" href={localizedPath("/register", locale())}>
                  {plan.cta}
                </a>
                <div class="design-plan-features">
                  <For each={plan.feats}>
                    {(feature) => (
                      <div class="design-plan-feature">
                        <span class="design-small-diamond" aria-hidden="true" />
                        <span>{feature}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </section>
      <DesignFaq />
    </>
  );
}
