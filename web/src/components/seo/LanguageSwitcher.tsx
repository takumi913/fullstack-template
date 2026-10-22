import { onSettled, For } from "solid-js";
import { getToolPageByPath } from "@/content/tool-pages";
import { getLandingPageByPath } from "@/content/landing-pages";
import { getPublicPageByPath } from "@/seo/pages";
import type { SiteLocale } from "@/i18n/locales";
import type { SeoAlternate } from "@/seo/localization";
import { publicPageCopy } from "@/seo/ui-copy";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { toolsmithLanguages } from "@/content/toolsmith-catalog";

export function LanguageSwitcher(props: {
  alternates?: SeoAlternate[];
  currentPath?: string;
  locale: SiteLocale;
}) {
  let element!: HTMLDetailsElement;
  const copy = () => toolsmithCopy(props.locale);
  const alternates = () =>
    props.alternates ??
    getToolPageByPath(props.currentPath)?.alternates ??
    getLandingPageByPath(props.currentPath)?.alternates ??
    getPublicPageByPath(props.currentPath ?? "")?.alternates;
  onSettled(() => {
    function dismiss(event: PointerEvent) {
      if (!element.contains(event.target as Node)) element.removeAttribute("open");
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  });
  return (
    <details
      class="design-language"
      ref={(node) => {
        element = node;
      }}
      aria-label={publicPageCopy(props.locale).languageVersions}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          element.removeAttribute("open");
          element.querySelector("summary")?.focus();
        }
      }}
    >
      <summary class="design-language-button" aria-label="Language">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <path d="M3 12h18" />
        </svg>
        <span>{props.locale === "zh-CN" ? "中文" : "EN"}</span>
        <span class="design-chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div class="design-language-list">
        <div class="design-language-heading">{copy().langLabel}</div>
        <For each={toolsmithLanguages}>
          {(language) => {
            const code = language.id === "zh" ? "zh-CN" : language.id;
            const alternate = () => alternates()?.find((item) => item.hreflang === code);
            const current = () => code === props.locale;
            const content = (
              <>
                <span>{language.native}</span>
                <span class="design-language-note">
                  {current() ? "" : alternate() ? language.code : copy().soon}
                </span>
                <span class="design-dot" aria-hidden="true" />
              </>
            );
            return (
              <>
                {alternate() ? (
                  <a
                    lang={code}
                    class={["design-language-item", { active: current() }]}
                    aria-current={current() ? "page" : undefined}
                    href={alternate()!.path}
                    onClick={() => element.removeAttribute("open")}
                  >
                    {content}
                  </a>
                ) : (
                  <span
                    class={["design-language-item", { active: current(), disabled: !current() }]}
                    aria-disabled={!current() ? "true" : "false"}
                  >
                    {content}
                  </span>
                )}
              </>
            );
          }}
        </For>
      </div>
    </details>
  );
}
