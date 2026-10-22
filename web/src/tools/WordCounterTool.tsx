import { createMemo, createSignal, type Element, For } from "solid-js";
import { useTranslation } from "@/i18n/context";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";

interface WordCounterToolProps {
  navigation?: Element;
}

export function WordCounterTool(props: WordCounterToolProps) {
  const { t } = useTranslation();
  const [text, setText] = createSignal("");
  const stats = createMemo(() => {
    const trimmed = text().trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      characters: text().length,
      lines: text() ? text().split(/\r?\n/).length : 0,
      paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
    };
  });
  const labels = ["words", "characters", "lines", "paragraphs"] as const;
  const output = () =>
    text() ? labels.map((label) => `${t(`counter.${label}`)}: ${stats()[label]}`).join("\n") : "";
  return (
    <ToolWorkspace
      navigation={
        props.navigation ?? (
          <span class="flex items-center gap-3 px-2 font-semibold">
            <span class="tool-glyph">Aa</span>
            {t("counter.text")}
          </span>
        )
      }
      options={
        <span class="trust-note">
          <span class="status-dot active" aria-hidden="true" />
          {t("workbench.statistics")}
        </span>
      }
      input={
        <>
          <label class="sr-only" for="word-counter-input">
            {t("counter.text")}
          </label>
          <textarea
            id="word-counter-input"
            class="tool-textarea"
            placeholder={t("counter.placeholder")}
            value={text()}
            onInput={(event) => setText(event.currentTarget.value)}
          />
        </>
      }
      inputLength={text().length}
      output={output()}
      result={
        <dl class="counter-stats">
          <For each={labels}>
            {(label) => (
              <div class="counter-stat">
                <dt>{t(`counter.${label}`)}</dt>
                <dd>{stats()[label].toLocaleString()}</dd>
              </div>
            )}
          </For>
        </dl>
      }
      onSample={() => setText(t("workbench.sampleText"))}
      onClear={() => setText("")}
    />
  );
}
