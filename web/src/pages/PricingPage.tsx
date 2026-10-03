import { useState } from "react";
import { Link } from "react-router";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { trackSpot } from "@/lib/track-spot";
import { DesignFaq } from "@/components/tools/DesignFaq";

export default function PricingPage() {
  const locale = useLocale(),
    copy = toolsmithCopy(locale);
  const [yearly, setYearly] = useState(false);
  const prices = locale === "en" ? [0, 5, 12] : [0, 29, 79],
    currency = locale === "en" ? "$" : "¥";
  return (
    <>
      <section className="design-container design-pricing" data-screen-label="Pricing">
        <div className="design-pricing-heading">
          <div className="design-eyebrow">{copy.priceEyebrow}</div>
          <h1 className="design-page-title">{copy.priceTitle}</h1>
          <p className="design-page-subtitle">{copy.priceSub}</p>
          <button
            type="button"
            className="design-billing"
            aria-label={`${copy.monthly} / ${copy.yearly}`}
            aria-pressed={yearly}
            onClick={() => setYearly(!yearly)}
          >
            <span className={`design-billing-tab ${!yearly ? "active" : ""}`}>{copy.monthly}</span>
            <span className={`design-billing-tab ${yearly ? "active" : ""}`}>
              {copy.yearly}
              <span className="design-billing-discount">-20%</span>
            </span>
          </button>
        </div>
        <div className="design-plan-grid">
          {copy.plans.map((plan, index) => (
            <div
              className={`design-plan ${index === 1 ? "featured" : ""}`}
              key={plan.name}
              onMouseMove={trackSpot}
            >
              <div className="design-card-top">
                <span className="design-plan-name">{plan.name}</span>
                {index === 1 && <span className="design-popular-label">{copy.popular}</span>}
              </div>
              <div className="design-plan-description">{plan.desc}</div>
              <div className="design-plan-price-row">
                <span className="design-plan-price">
                  {currency}
                  {yearly ? Math.round(prices[index] * 0.8) : prices[index]}
                </span>
                <span className="design-plan-unit">
                  {index === 2 ? copy.perSeat : copy.perMonth}
                </span>
              </div>
              <Link className="design-plan-button" to={localizedPath("/register", locale)}>
                {plan.cta}
              </Link>
              <div className="design-plan-features">
                {plan.feats.map((feature) => (
                  <div className="design-plan-feature" key={feature}>
                    <span className="design-small-diamond" aria-hidden="true" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <DesignFaq />
    </>
  );
}
