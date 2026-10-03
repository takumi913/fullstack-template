import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";

interface WordCounterToolProps {
  navigation?: ReactNode;
}

export function WordCounterTool({ navigation }: WordCounterToolProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const stats = {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    characters: text.length,
    lines: text ? text.split(/\r?\n/).length : 0,
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
  };
  const labels = Object.keys(stats) as Array<keyof typeof stats>;
  const output = text
    ? labels.map((label) => `${t(`counter.${label}`)}: ${stats[label]}`).join("\n")
    : "";
  return (
    <ToolWorkspace
      navigation={
        navigation ?? (
          <span className="flex items-center gap-3 px-2 font-semibold">
            <span className="tool-glyph">Aa</span>
            {t("counter.text")}
          </span>
        )
      }
      options={
        <span className="trust-note">
          <span className="status-dot active" aria-hidden="true" />
          {t("workbench.statistics")}
        </span>
      }
      input={
        <>
          <label className="sr-only" htmlFor="word-counter-input">
            {t("counter.text")}
          </label>
          <textarea
            id="word-counter-input"
            className="tool-textarea"
            placeholder={t("counter.placeholder")}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </>
      }
      inputLength={text.length}
      output={output}
      result={
        <dl className="counter-stats">
          {labels.map((label) => (
            <div className="counter-stat" key={label}>
              <dt>{t(`counter.${label}`)}</dt>
              <dd>{stats[label].toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      }
      onSample={() => setText(t("workbench.sampleText"))}
      onClear={() => setText("")}
    />
  );
}
