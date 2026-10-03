import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";

const initialValue =
  '{\n  "name": "Toolsmith",\n  "private": true,\n  "free": true,\n  "tools": ["JSON Formatter", "Word Counter"]\n}';

interface JsonFormatterToolProps {
  navigation?: ReactNode;
}

export function JsonFormatterTool({ navigation }: JsonFormatterToolProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState(initialValue);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"format" | "minify">("format");

  function updateInput(value: string) {
    setInput(value);
    setOutput("");
    setError("");
  }
  function transform() {
    try {
      const parsed = JSON.parse(input) as unknown;
      setOutput(JSON.stringify(parsed, null, mode === "format" ? 2 : 0));
      setError("");
    } catch (cause) {
      setOutput("");
      setError(cause instanceof Error ? cause.message : t("json.invalid"));
    }
  }
  return (
    <ToolWorkspace
      navigation={
        navigation ?? (
          <span className="flex items-center gap-3 px-2 font-semibold">
            <span className="tool-glyph">{"{}"}</span>
            {t("json.input")}
          </span>
        )
      }
      options={
        <>
          <span className="eyebrow !text-muted-foreground mr-1">{t("workbench.format")}</span>
          {(["format", "minify"] as const).map((option) => (
            <button
              className="option-pill"
              type="button"
              aria-pressed={mode === option}
              key={option}
              onClick={() => {
                setMode(option);
                setOutput("");
              }}
            >
              {t(`json.${option}`)}
            </button>
          ))}
        </>
      }
      input={
        <>
          <label className="sr-only" htmlFor="json-input">
            {t("json.input")}
          </label>
          <textarea
            id="json-input"
            className="tool-textarea font-mono"
            value={input}
            spellCheck={false}
            onChange={(event) => updateInput(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                transform();
              }
            }}
          />
        </>
      }
      inputLength={input.length}
      output={output}
      error={error}
      onSample={() => updateInput(initialValue)}
      onClear={() => updateInput("")}
      onRun={transform}
    />
  );
}
