import { createSignal, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import { localizedPath } from "@/i18n/locales";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import {
  catalogLanguage,
  catalogToolPath,
  toolsmithCatalog,
  toolsmithCategories,
} from "@/content/toolsmith-catalog";

export function ToolMenu() {
  const locale = useLocale();
  const language = () => catalogLanguage(locale());
  const copy = () => toolsmithCopy(locale());
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = createSignal(false);
  const closeMenu = () => setToolsOpen(false);
  return (
    <div
      class="design-tools-menu-anchor"
      onMouseEnter={() => setToolsOpen(true)}
      onMouseLeave={closeMenu}
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenu();
      }}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          closeMenu();
      }}
    >
      <button
        type="button"
        class={[
          "design-tools-toggle",
          { active: toolsOpen() || location.pathname.includes("/tools") },
        ]}
        aria-expanded={toolsOpen() ? "true" : "false"}
        aria-controls="tools-mega-menu"
        onClick={() => setToolsOpen((opened) => !opened)}
      >
        {copy().navTools}
        <span class={["design-chevron", { open: toolsOpen() }]} aria-hidden="true">
          ▾
        </span>
      </button>
      {toolsOpen() && (
        <div class="design-tools-menu-wrap">
          <div id="tools-mega-menu" class="design-tools-menu">
            <div class="design-menu-columns">
              <For each={toolsmithCategories.filter((category) => category.id !== "all")}>
                {(category) => (
                  <div class="design-menu-column">
                    <div class="design-menu-label">{category[language()]}</div>
                    <For each={toolsmithCatalog.filter((tool) => tool.cat === category.id)}>
                      {(tool) => (
                        <a
                          class="design-menu-tool"
                          href={catalogToolPath(tool.id, locale())}
                          onClick={closeMenu}
                        >
                          <span class="design-menu-glyph">{tool.g}</span>
                          <span class="design-menu-tool-name">{tool[language()][0]}</span>
                          {(tool.hot || tool.isNew) && (
                            <span class="design-dot" aria-hidden="true" />
                          )}
                        </a>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>
            <div class="design-menu-bottom">
              <span>{copy().menuFoot}</span>
              <a href={localizedPath("/tools", locale())} onClick={closeMenu}>
                {copy().viewAll} →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
