import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale } from "@/i18n/useLocale";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogLanguage, toolsmithCatalog, type TextMode } from "@/content/toolsmith-catalog";
import { useAsyncAction } from "@/lib/useAsyncAction";
import { useToolPageDefinition } from "./context";
import { textOptions, textPreviewResults, textSamples } from "./text-preview";

export function TextWorkbench() {
  const page = useToolPageDefinition();
  const locale = useLocale(),
    language = catalogLanguage(locale),
    copy = toolsmithCopy(locale);
  const tool = toolsmithCatalog.find((item) => item.id === page.runtime?.toolId)!;
  const [mode, setMode] = useState<TextMode>(tool.mode);
  const [options, setOptions] = useState({ rewrite: 0, summarize: 1, translate: 0 });
  const [input, setInput] = useState(textSamples[language]);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0),
    [elapsed, setElapsed] = useState(0),
    [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runLock = useRef(false);
  const { error, run: copyOutput } = useAsyncAction();
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(copiedTimer.current);
    },
    [],
  );
  const running = status === "running";
  function changeMode(next: TextMode) {
    clearTimeout(timer.current);
    runLock.current = false;
    setMode(next);
    setOutput("");
    setStatus("idle");
    setProgress(0);
  }
  function run() {
    if (runLock.current || !input.trim()) return;
    runLock.current = true;
    setStatus("running");
    setOutput("");
    setProgress(12);
    setCopied(false);
    const started = Date.now();
    // This is the original design's streamed preview, not a production model response.
    let text = textPreviewResults[language][mode];
    if (tool.id === "counter") {
      const words = input.trim() ? input.trim().split(/\s+/).length : 0;
      const sentences = input.split(/[.!?。！？]+/).filter((part) => part.trim()).length;
      text =
        language === "zh"
          ? `字数：${input.length}\n词数：${words}\n句子：${sentences}\n阅读时长：${Math.max(1, Math.ceil(words / 200))} 分钟`
          : `Characters: ${input.length}\nWords: ${words}\nSentences: ${sentences}\nReading time: ${Math.max(1, Math.ceil(words / 200))} min`;
    }
    if (tool.id === "case")
      text =
        options.rewrite === 0
          ? input.toUpperCase()
          : options.rewrite === 1
            ? input.toLowerCase()
            : input.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
    if (tool.id === "detect")
      text = /\p{Script=Han}/u.test(input)
        ? "中文 (Chinese)"
        : /\p{Script=Hiragana}|\p{Script=Katakana}/u.test(input)
          ? "日本語 (Japanese)"
          : "English";
    const step = Math.max(2, Math.round(text.length / 160));
    let length = 0;
    function stream() {
      length = Math.min(text.length, length + step);
      setOutput(text.slice(0, length));
      setProgress(30 + (70 * length) / text.length);
      if (length === text.length) {
        setStatus("done");
        setElapsed((Date.now() - started) / 1000);
        runLock.current = false;
      } else timer.current = setTimeout(stream, 18);
    }
    timer.current = setTimeout(stream, 700 + 18);
  }
  async function copyResult() {
    if (!output) return;
    if (await copyOutput(() => navigator.clipboard.writeText(output))) {
      clearTimeout(copiedTimer.current);
      setCopied(true);
      copiedTimer.current = setTimeout(() => setCopied(false), 1600);
    }
  }
  const modeLabels =
    language === "zh"
      ? { rewrite: "改写", summarize: "摘要", translate: "翻译" }
      : { rewrite: "Rewrite", summarize: "Summarize", translate: "Translate" };
  return (
    <div className="design-editor">
      <div className="design-editor-toolbar">
        <div
          className="design-mode-tabs"
          aria-label={language === "zh" ? "处理模式" : "Processing mode"}
        >
          {(["rewrite", "summarize", "translate"] as TextMode[]).map((value) => (
            <button
              type="button"
              key={value}
              className={`design-mode-tab ${mode === value ? "active" : ""}`}
              aria-pressed={mode === value}
              onClick={() => changeMode(value)}
            >
              {modeLabels[value]}
            </button>
          ))}
        </div>
        <div className="design-options">
          <span className="design-option-label">{copy.optT[mode]}</span>
          {textOptions[mode][language].map((option, index) => (
            <button
              type="button"
              key={option}
              className={`design-option ${options[mode] === index ? "active" : ""}`}
              aria-pressed={options[mode] === index}
              onClick={() => setOptions({ ...options, [mode]: index })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="design-editor-panes">
        <div className="design-input-pane">
          <textarea
            className="design-input"
            value={input}
            maxLength={3000}
            aria-label={copy.inPh}
            placeholder={copy.inPh}
            onChange={(event) => setInput(event.target.value.slice(0, 3000))}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                run();
              }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file?.name.endsWith(".txt"))
                void file.text().then((text) => setInput(text.slice(0, 3000)));
            }}
          />
          <div className="design-pane-actions">
            <span className="design-pane-meta">
              {input.length} / 3000 {copy.chars}
            </span>
            <button
              type="button"
              className="design-plain-button"
              onClick={() => setInput(textSamples[language])}
            >
              {copy.sample}
            </button>
            <button type="button" className="design-plain-button" onClick={() => setInput("")}>
              {copy.clear}
            </button>
            <button
              type="button"
              className="design-run-button"
              onClick={run}
              disabled={running || !input.trim()}
            >
              <span>{running ? copy.running : status === "done" ? copy.again : copy.run}</span>
              <span className="design-run-shortcut">⌘↵</span>
            </button>
          </div>
        </div>
        <div className="design-output-pane">
          <div
            className={`design-output-progress ${running ? "running" : ""}`}
            style={{ "--progress": `${progress}%` } as CSSProperties}
          />
          <div className="design-output-heading">
            <span className="design-output-label">{copy.output}</span>
            <span className={`design-output-status ${status}`}>
              <span className="design-dot" aria-hidden="true" />
              {running ? copy.stRun : status === "done" ? copy.stDone : copy.stIdle}
            </span>
          </div>
          {/* The original result area preserves these line breaks; they also define its empty-state spacing. */}
          <div className="design-output" aria-live={running ? "off" : "polite"}>
            {"\n              "}
            {output && (
              <>
                {"\n                "}
                <span>{output}</span>
                {running && <span className="design-stream-cursor" aria-hidden="true" />}
                {"\n              "}
              </>
            )}
            {"\n              "}
            {!output && (
              <>
                {"\n                "}
                <div className="design-output-empty">
                  <div className="design-output-empty-inner">
                    <span className="design-output-empty-diamond" aria-hidden="true" />
                    <span className="design-output-empty-copy">{copy.outEmpty}</span>
                  </div>
                </div>
                {"\n              "}
              </>
            )}
            {"\n            "}
          </div>
          <div className="design-pane-actions">
            <span className="design-pane-meta">
              {status === "done"
                ? `${output.length} ${copy.outChars} · ${elapsed.toFixed(1)}${copy.sec}`
                : output
                  ? `${output.length} ${copy.outChars}`
                  : "—"}
            </span>
            <button type="button" className="design-copy-button" onClick={() => void copyResult()}>
              {copied ? copy.copied : copy.copy}
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className="design-inline-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
