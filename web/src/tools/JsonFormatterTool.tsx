import { createSignal, type Element, For } from "solid-js";
import { useTranslation } from "@/i18n/context";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";

const initialValue =
  '{\n  "name": "Toolsmith",\n  "private": true,\n  "free": true,\n  "tools": ["JSON Formatter", "Word Counter"]\n}';

interface JsonFormatterToolProps {
  navigation?: Element;
}

export function JsonFormatterTool(props: JsonFormatterToolProps) {
  const { t } = useTranslation();
  const [input, setInput] = createSignal(initialValue);
  const [output, setOutput] = createSignal("");
  const [error, setError] = createSignal("");
  const [mode, setMode] = createSignal<"format" | "minify">("format");

  function updateInput(value: string) {
    setInput(value);
    setOutput("");
    setError("");
  }
  function transform() {
    try {
      const parsed = JSON.parse(input()) as unknown;
      setOutput(JSON.stringify(parsed, null, mode() === "format" ? 2 : 0));
      setError("");
    } catch (cause) {
      setOutput("");
      setError(cause instanceof Error ? cause.message : t("json.invalid"));
    }
  }
  return (
    <ToolWorkspace
      navigation={
        props.navigation ?? (
          <span class="flex items-center gap-3 px-2 font-semibold">
            <span class="tool-glyph">{"{}"}</span>
            {t("json.input")}
          </span>
        )
      }
      options={
        <>
          <span class="eyebrow !text-muted-foreground mr-1">{t("workbench.format")}</span>
          <For each={["format", "minify"] as const}>
            {(option) => (
              <button
                class="option-pill"
                type="button"
                aria-pressed={mode() === option ? "true" : "false"}
                onClick={() => {
                  setMode(option);
                  setOutput("");
                }}
              >
                {t(`json.${option}`)}
              </button>
            )}
          </For>
        </>
      }
      input={
        <>
          <label class="sr-only" for="json-input">
            {t("json.input")}
          </label>
          <textarea
            id="json-input"
            class="tool-textarea font-mono"
            value={input()}
            spellcheck="false"
            onInput={(event) => updateInput(event.currentTarget.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                transform();
              }
            }}
          />
        </>
      }
      inputLength={input().length}
      output={output()}
      error={error()}
      onSample={() => updateInput(initialValue)}
      onClear={() => updateInput("")}
      onRun={transform}
    />
  );
}
