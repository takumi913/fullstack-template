import { useState } from "react";
import { Link, useLocation } from "react-router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import {
  catalogLanguage,
  catalogToolPath,
  toolsmithCatalog,
  toolsmithCategories,
} from "@/content/toolsmith-catalog";

export function ToolMenu() {
  const locale = useLocale(),
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const { pathname } = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const closeMenu = () => setToolsOpen(false);
  return (
    <div
      className="design-tools-menu-anchor"
      onMouseEnter={() => setToolsOpen(true)}
      onMouseLeave={closeMenu}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenu();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
      }}
    >
      <button
        type="button"
        className={`design-tools-toggle ${toolsOpen || pathname.includes("/tools") ? "active" : ""}`}
        aria-expanded={toolsOpen}
        aria-controls="tools-mega-menu"
        onClick={() => setToolsOpen(!toolsOpen)}
      >
        {copy.navTools}
        <span className={`design-chevron ${toolsOpen ? "open" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {toolsOpen && (
        <div className="design-tools-menu-wrap">
          <div id="tools-mega-menu" className="design-tools-menu">
            <div className="design-menu-columns">
              {toolsmithCategories
                .filter((category) => category.id !== "all")
                .map((category) => (
                  <div className="design-menu-column" key={category.id}>
                    <div className="design-menu-label">{category[language]}</div>
                    {toolsmithCatalog
                      .filter((tool) => tool.cat === category.id)
                      .map((tool) => (
                        <Link
                          className="design-menu-tool"
                          key={tool.id}
                          to={catalogToolPath(tool.id, locale)}
                          onClick={closeMenu}
                        >
                          <span className="design-menu-glyph">{tool.g}</span>
                          <span className="design-menu-tool-name">{tool[language][0]}</span>
                          {(tool.hot || tool.isNew) && (
                            <span className="design-dot" aria-hidden="true" />
                          )}
                        </Link>
                      ))}
                  </div>
                ))}
            </div>
            <div className="design-menu-bottom">
              <span>{copy.menuFoot}</span>
              <Link to={localizedPath("/tools", locale)} onClick={closeMenu}>
                {copy.viewAll} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
