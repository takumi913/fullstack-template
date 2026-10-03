import { useState } from "react";
import { Link } from "react-router";
import { useLocale } from "@/i18n/useLocale";
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
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all");
  const tools = filterCatalog(query, category);
  return (
    <section className="design-container design-directory" data-screen-label="Directory">
      <div className="design-eyebrow">{copy.dirEyebrow}</div>
      <h1 className="design-page-title">{copy.dirTitle}</h1>
      <p className="design-page-subtitle">{copy.dirSub}</p>
      <div className="design-directory-controls">
        <label className="design-search">
          <span className="design-search-circle" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.dirSearch}
            aria-label={copy.search}
          />
        </label>
        <div className="design-filters">
          {toolsmithCategories.map((cat) => (
            <button
              type="button"
              className={`design-filter ${category === cat.id ? "active" : ""}`}
              key={cat.id}
              aria-pressed={category === cat.id}
              onClick={() => setCategory(cat.id)}
            >
              {cat[language]}
              <span className="design-filter-count">
                {cat.id === "all"
                  ? toolsmithCatalog.length
                  : toolsmithCatalog.filter((tool) => tool.cat === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="design-directory-grid">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            className="design-directory-card"
            to={catalogToolPath(tool.id, locale)}
            onMouseMove={trackSpot}
          >
            <div className="design-card-top">
              <span className="design-directory-glyph">{tool.g}</span>
              {(tool.hot || tool.isNew) && (
                <span className="design-tool-badge">
                  {tool.isNew ? "New" : language === "zh" ? "热门" : "Popular"}
                </span>
              )}
            </div>
            <div>
              <div className="design-directory-name">{tool[language][0]}</div>
              <div className="design-directory-desc">{tool[language][1]}</div>
            </div>
            <div className="design-directory-category">
              {toolsmithCategories.find((cat) => cat.id === tool.cat)![language]}
            </div>
          </Link>
        ))}
      </div>
      {!tools.length && <div className="design-directory-empty">{copy.noResult}</div>}
    </section>
  );
}
