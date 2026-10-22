import { For } from "solid-js";
import { createEffect, createSignal, onSettled } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import {
  catalogLanguage,
  catalogToolPath,
  filterCatalog,
  toolsmithCategories,
} from "@/content/toolsmith-catalog";

export function CommandPalette() {
  const locale = useLocale();
  const language = () => catalogLanguage(locale());
  const copy = () => toolsmithCopy(locale());
  const navigate = useNavigate();
  let dialog!: HTMLDialogElement;
  let input!: HTMLInputElement;
  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal(0);
  const tools = () => filterCatalog(query());
  const active = () => Math.min(selected(), Math.max(0, tools().length - 1));
  onSettled(() => {
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
  });
  createEffect(open, (visible) => {
    if (visible) {
      dialog.showModal();
      input.focus();
    } else dialog.close();
  });
  return (
    <dialog
      ref={(node) => {
        dialog = node;
      }}
      class="design-palette-backdrop"
      aria-label={copy().search}
      onCancel={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div class="design-palette">
        <div class="design-palette-search">
          <span class="design-search-circle" aria-hidden="true" />
          <input
            ref={(node) => {
              input = node;
            }}
            value={query()}
            placeholder={copy().palPh}
            aria-label={copy().search}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
              setSelected(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelected(Math.min(tools().length - 1, active() + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelected(Math.max(0, active() - 1));
              }
              if (event.key === "Enter" && tools()[active()]) {
                navigate(catalogToolPath(tools()[active()].id, locale()));
                setOpen(false);
              }
            }}
          />
          <span class="design-palette-escape">esc</span>
        </div>
        <div class="design-palette-list">
          <For each={tools()}>
            {(tool, index) => (
              <a
                class={["design-palette-tool", { active: active() === index() }]}
                href={catalogToolPath(tool.id, locale())}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setSelected(index())}
              >
                <span class="design-palette-glyph">{tool.g}</span>
                <span class="design-palette-copy">
                  <span class="design-palette-name">{tool[language()][0]}</span>
                  <span class="design-palette-description">{tool[language()][1]}</span>
                </span>
                <span class="design-palette-category">
                  {toolsmithCategories.find((category) => category.id === tool.cat)![language()]}
                </span>
              </a>
            )}
          </For>
          {!tools().length && <div class="design-palette-empty">{copy().noResult}</div>}
        </div>
        <div class="design-palette-bottom">
          <span>↑↓ {copy().palNav}</span>
          <span>↵ {copy().palOpen}</span>
        </div>
      </div>
    </dialog>
  );
}
