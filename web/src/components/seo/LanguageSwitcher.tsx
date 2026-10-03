import { useEffect, useRef } from "react";
import { Link } from "react-router";
import type { SiteLocale } from "@/i18n/locales";
import type { SeoAlternate } from "@/seo/localization";
import { publicPageCopy } from "@/seo/ui-copy";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { toolsmithLanguages } from "@/content/toolsmith-catalog";

export function LanguageSwitcher({
  alternates,
  locale,
}: {
  alternates?: SeoAlternate[];
  currentPath?: string;
  locale: SiteLocale;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const copy = toolsmithCopy(locale);
  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) ref.current?.removeAttribute("open");
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return (
    <details
      className="design-language"
      ref={ref}
      aria-label={publicPageCopy(locale).languageVersions}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          ref.current?.removeAttribute("open");
          ref.current?.querySelector("summary")?.focus();
        }
      }}
    >
      <summary className="design-language-button" aria-label="Language">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span>{locale === "zh-CN" ? "中文" : "EN"}</span>
        <span className="design-chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="design-language-list">
        <div className="design-language-heading">{copy.langLabel}</div>
        {toolsmithLanguages.map((language) => {
          const code = language.id === "zh" ? "zh-CN" : language.id;
          const alternate = alternates?.find((item) => item.hreflang === code);
          const current = code === locale;
          const content = (
            <>
              <span>{language.native}</span>
              <span className="design-language-note">
                {current ? "" : alternate ? language.code : copy.soon}
              </span>
              <span className="design-dot" aria-hidden="true" />
            </>
          );
          return alternate ? (
            <Link
              key={code}
              lang={code}
              className={`design-language-item ${current ? "active" : ""}`}
              aria-current={current ? "page" : undefined}
              to={alternate.path}
              onClick={() => ref.current?.removeAttribute("open")}
            >
              {content}
            </Link>
          ) : (
            <span
              key={code}
              className={`design-language-item ${current ? "active" : "disabled"}`}
              aria-disabled={!current}
            >
              {content}
            </span>
          );
        })}
      </div>
    </details>
  );
}
