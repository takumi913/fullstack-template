import { For } from "solid-js";
import { useLocation } from "@solidjs/router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { Brand } from "./Brand";
import { trackSpot } from "@/lib/track-spot";

export function Footer() {
  const locale = useLocale(),
    copy = () => toolsmithCopy(locale());
  const location = useLocation();
  const home = () => location.pathname === localizedPath("/", locale());
  const paths = () => [
    [
      localizedPath("/tools/rewriter", locale()),
      localizedPath("/tools/summarizer", locale()),
      localizedPath("/tools/translator", locale()),
      localizedPath("/tools", locale()),
    ],
    [
      localizedPath("/resources", locale()),
      localizedPath("/pricing", locale()),
      localizedPath("/resources", locale()),
    ],
    [
      localizedPath("/legal/privacy-policy", locale()),
      localizedPath("/legal/terms", locale()),
      localizedPath("/legal/privacy-policy", locale()),
    ],
  ];
  return (
    <>
      <section class={["design-container design-footer-space", { home: home() }]}>
        {!home() && (
          <div class="design-footer-cta" onMouseMove={trackSpot}>
            <div>
              <h2>{copy().ctaTitle}</h2>
              <p>{copy().ctaSub}</p>
            </div>
            <div class="design-cta-actions">
              <a class="design-button" href={localizedPath("/pricing", locale())}>
                {copy().navPricing}
              </a>
              <a class="design-button primary" href={localizedPath("/register", locale())}>
                {copy().ctaBtn} →
              </a>
            </div>
          </div>
        )}
      </section>
      <footer class="design-footer">
        <div class="design-footer-grid">
          <div class="design-footer-brand">
            <Brand />
            <p>{copy().fTag}</p>
          </div>
          <For each={copy().fCols}>
            {(column, index) => (
              <div class="design-footer-column">
                <div class="design-footer-column-title">{column.h}</div>
                <For each={column.l}>
                  {(label, item) => <a href={paths()[index()][item()]}>{label}</a>}
                </For>
              </div>
            )}
          </For>
        </div>
        <div class="design-footer-bottom">
          <span>© 2026 Toolsmith</span>
        </div>
      </footer>
    </>
  );
}
