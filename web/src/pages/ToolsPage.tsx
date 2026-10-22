import { createSignal, For } from "solid-js";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import {
  catalogLanguage,
  catalogToolPath,
  filterCatalog,
  toolsmithCatalog,
  toolsmithCategories,
} from "@/content/toolsmith-catalog";
import { trackSpot } from "@/lib/track-spot";

export default function ToolsPage() {
  const locale = useLocale(),
    language = () => catalogLanguage(locale()),
    copy = () => toolsmithCopy(locale());
  const [query, setQuery] = createSignal(""),
    [category, setCategory] = createSignal("all");
  const tools = () => filterCatalog(query(), category());
  return (
    <section class="design-container design-directory" data-screen-label="Directory">
      <div class="design-eyebrow">{copy().dirEyebrow}</div>
      <h1 class="design-page-title">{copy().dirTitle}</h1>
      <p class="design-page-subtitle">{copy().dirSub}</p>
      <div class="design-directory-controls">
        <label class="design-search">
          <span class="design-search-circle" aria-hidden="true" />
          <input
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
            placeholder={copy().dirSearch}
            aria-label={copy().search}
          />
        </label>
        <div class="design-filters">
          <For each={toolsmithCategories}>
            {(cat) => (
              <button
                type="button"
                class={["design-filter", { active: category() === cat.id }]}
                aria-pressed={category() === cat.id ? "true" : "false"}
                onClick={() => setCategory(cat.id)}
              >
                {cat[language()]}
                <span class="design-filter-count">
                  {cat.id === "all"
                    ? toolsmithCatalog.length
                    : toolsmithCatalog.filter((tool) => tool.cat === cat.id).length}
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
      <div class="design-directory-grid">
        <For each={tools()}>
          {(tool) => (
            <a
              class="design-directory-card"
              href={catalogToolPath(tool.id, locale())}
              onMouseMove={trackSpot}
            >
              <div class="design-card-top">
                <span class="design-directory-glyph">{tool.g}</span>
                {(tool.hot || tool.isNew) && (
                  <span class="design-tool-badge">
                    {tool.isNew ? "New" : language() === "zh" ? "热门" : "Popular"}
                  </span>
                )}
              </div>
              <div>
                <div class="design-directory-name">{tool[language()][0]}</div>
                <div class="design-directory-desc">{tool[language()][1]}</div>
              </div>
              <div class="design-directory-category">
                {toolsmithCategories.find((cat) => cat.id === tool.cat)![language()]}
              </div>
            </a>
          )}
        </For>
      </div>
      {!tools().length && <div class="design-directory-empty">{copy().noResult}</div>}
    </section>
  );
}
