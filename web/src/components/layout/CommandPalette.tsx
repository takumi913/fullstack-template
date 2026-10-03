import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import {
  catalogLanguage,
  catalogToolPath,
  filterCatalog,
  toolsmithCategories,
} from "@/content/toolsmith-catalog";

export function CommandPalette() {
  const locale = useLocale(),
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(0);
  const tools = filterCatalog(query);
  const active = Math.min(selected, Math.max(0, tools.length - 1));
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuery("");
        setSelected(0);
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (open) {
      dialog.current!.showModal();
      input.current!.focus();
    } else dialog.current!.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="design-palette-backdrop"
      aria-label={copy.search}
      onCancel={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div className="design-palette">
        <div className="design-palette-search">
          <span className="design-search-circle" aria-hidden="true" />
          <input
            ref={input}
            value={query}
            placeholder={copy.palPh}
            aria-label={copy.search}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelected(Math.min(tools.length - 1, active + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelected(Math.max(0, active - 1));
              }
              if (event.key === "Enter" && tools[active]) {
                navigate(catalogToolPath(tools[active].id, locale));
                setOpen(false);
              }
            }}
          />
          <span className="design-palette-escape">esc</span>
        </div>
        <div className="design-palette-list">
          {tools.map((tool, index) => (
            <Link
              key={tool.id}
              className={`design-palette-tool ${active === index ? "active" : ""}`}
              to={catalogToolPath(tool.id, locale)}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setSelected(index)}
            >
              <span className="design-palette-glyph">{tool.g}</span>
              <span className="design-palette-copy">
                <span className="design-palette-name">{tool[language][0]}</span>
                <span className="design-palette-description">{tool[language][1]}</span>
              </span>
              <span className="design-palette-category">
                {toolsmithCategories.find((category) => category.id === tool.cat)![language]}
              </span>
            </Link>
          ))}
          {!tools.length && <div className="design-palette-empty">{copy.noResult}</div>}
        </div>
        <div className="design-palette-bottom">
          <span>↑↓ {copy.palNav}</span>
          <span>↵ {copy.palOpen}</span>
        </div>
      </div>
    </dialog>
  );
}
