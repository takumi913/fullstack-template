import { Link, useLocation } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { Brand } from "./Brand";
import { trackSpot } from "@/lib/track-spot";

export function Footer() {
  const locale = useLocale(),
    copy = toolsmithCopy(locale);
  const { pathname } = useLocation();
  const home = pathname === localizedPath("/", locale);
  const paths = [
    [
      localizedPath("/tools/rewriter", locale),
      localizedPath("/tools/summarizer", locale),
      localizedPath("/tools/translator", locale),
      localizedPath("/tools", locale),
    ],
    [
      localizedPath("/resources", locale),
      localizedPath("/pricing", locale),
      localizedPath("/resources", locale),
    ],
    [
      localizedPath("/legal/privacy-policy", locale),
      localizedPath("/legal/terms", locale),
      localizedPath("/legal/privacy-policy", locale),
    ],
  ];
  return (
    <>
      <section className={`design-container design-footer-space ${home ? "home" : ""}`}>
        {!home && (
          <div className="design-footer-cta" onMouseMove={trackSpot}>
            <div>
              <h2>{copy.ctaTitle}</h2>
              <p>{copy.ctaSub}</p>
            </div>
            <div className="design-cta-actions">
              <Link className="design-button" to={localizedPath("/pricing", locale)}>
                {copy.navPricing}
              </Link>
              <Link className="design-button primary" to={localizedPath("/register", locale)}>
                {copy.ctaBtn} →
              </Link>
            </div>
          </div>
        )}
      </section>
      <footer className="design-footer">
        <div className="design-footer-grid">
          <div className="design-footer-brand">
            <Brand />
            <p>{copy.fTag}</p>
          </div>
          {copy.fCols.map((column, index) => (
            <div className="design-footer-column" key={column.h}>
              <div className="design-footer-column-title">{column.h}</div>
              {column.l.map((label, item) => (
                <Link key={label} to={paths[index][item]}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="design-footer-bottom">
          <span>© 2026 Toolsmith</span>
          <span>{copy.rights}</span>
        </div>
      </footer>
    </>
  );
}
