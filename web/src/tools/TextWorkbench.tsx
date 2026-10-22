import { createSignal, onCleanup, untrack, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { useLocale } from "@/i18n/context";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { catalogLanguage, toolsmithCatalog, type TextMode } from "@/content/toolsmith-catalog";
import { createAsyncAction } from "@/lib/createAsyncAction";
import { useToolPageDefinition } from "./context";
import { textOptions, textPreviewResults, textSamples } from "./text-preview";

export function TextWorkbench() {
  const page = useToolPageDefinition();
  const locale = useLocale();
  const language = () => catalogLanguage(locale());
  const copy = () => toolsmithCopy(locale());
  const tool = untrack(() => toolsmithCatalog.find((item) => item.id === page().runtime?.toolId)!);
  const [mode, setMode] = createSignal<TextMode>(tool.mode);
  const [options, setOptions] = createSignal({ rewrite: 0, summarize: 1, translate: 0 });
  const [input, setInput] = createSignal(untrack(() => textSamples[language()]));
  const [output, setOutput] = createSignal("");
  const [status, setStatus] = createSignal<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = createSignal(0),
    [elapsed, setElapsed] = createSignal(0),
    [copied, setCopied] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;
  let runLock = false;
  const { error, run: copyOutput } = createAsyncAction();
  onCleanup(() => {
    clearTimeout(timer);
    clearTimeout(copiedTimer);
  });
  const running = () => status() === "running";
  function changeMode(next: TextMode) {
    clearTimeout(timer);
    runLock = false;
    setMode(next);
    setOutput("");
    setStatus("idle");
    setProgress(0);
  }
  function run() {
    if (runLock || !input().trim()) return;
    runLock = true;
    setStatus("running");
    setOutput("");
    setProgress(12);
    setCopied(false);
    const started = Date.now();
    // This is the original design's streamed preview, not a production model response.
    let text = textPreviewResults[language()][mode()];
    if (tool.id === "counter") {
      const words = input().trim() ? input().trim().split(/\s+/).length : 0;
      const sentences = input()
        .split(/[.!?。！？]+/)
        .filter((part) => part.trim()).length;
      text =
        language() === "zh"
          ? `字数：${input().length}\n词数：${words}\n句子：${sentences}\n阅读时长：${Math.max(1, Math.ceil(words / 200))} 分钟`
          : `Characters: ${input().length}\nWords: ${words}\nSentences: ${sentences}\nReading time: ${Math.max(1, Math.ceil(words / 200))} min`;
    }
    if (tool.id === "case")
      text =
        options().rewrite === 0
          ? input().toUpperCase()
          : options().rewrite === 1
            ? input().toLowerCase()
            : input()
                .toLowerCase()
                .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
    if (tool.id === "detect")
      text = /\p{Script=Han}/u.test(input())
        ? "中文 (Chinese)"
        : /\p{Script=Hiragana}|\p{Script=Katakana}/u.test(input())
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
        runLock = false;
      } else timer = setTimeout(stream, 18);
    }
    timer = setTimeout(stream, 700 + 18);
  }
  async function copyResult() {
    const result = output();
    if (!result) return;
    if (await copyOutput(() => navigator.clipboard.writeText(result))) {
      clearTimeout(copiedTimer);
      setCopied(true);
      copiedTimer = setTimeout(() => setCopied(false), 1600);
    }
  }
  const modeLabels = () =>
    language() === "zh"
      ? { rewrite: "改写", summarize: "摘要", translate: "翻译" }
      : { rewrite: "Rewrite", summarize: "Summarize", translate: "Translate" };
  return (
    <div class="design-editor">
      <div class="design-editor-toolbar">
        <div
          class="design-mode-tabs"
          aria-label={language() === "zh" ? "处理模式" : "Processing mode"}
        >
          <For each={["rewrite", "summarize", "translate"] as TextMode[]}>
            {(value) => (
              <button
                type="button"
                class={["design-mode-tab", { active: mode() === value }]}
                aria-pressed={mode() === value ? "true" : "false"}
                onClick={() => changeMode(value)}
              >
                {modeLabels()[value]}
              </button>
            )}
          </For>
        </div>
        <div class="design-options">
          <span class="design-option-label">{copy().optT[mode()]}</span>
          <For each={textOptions[mode()][language()]}>
            {(option, index) => (
              <button
                type="button"
                class={["design-option", { active: options()[mode()] === index() }]}
                aria-pressed={options()[mode()] === index() ? "true" : "false"}
                onClick={() => setOptions((value) => ({ ...value, [mode()]: index() }))}
              >
                {option}
              </button>
            )}
          </For>
        </div>
      </div>
      <div class="design-editor-panes">
        <div class="design-input-pane">
          <textarea
            class="design-input"
            value={input()}
            maxlength={3000}
            aria-label={copy().inPh}
            placeholder={copy().inPh}
            onInput={(event) => setInput(event.currentTarget.value.slice(0, 3000))}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                run();
              }
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer?.files[0];
              if (file?.name.endsWith(".txt"))
                void file.text().then((text) => setInput(text.slice(0, 3000)));
            }}
          />
          <div class="design-pane-actions">
            <span class="design-pane-meta">
              {input().length} / 3000 {copy().chars}
            </span>
            <button
              type="button"
              class="design-plain-button"
              onClick={() => setInput(textSamples[language()])}
            >
              {copy().sample}
            </button>
            <button type="button" class="design-plain-button" onClick={() => setInput("")}>
              {copy().clear}
            </button>
            <button
              type="button"
              class="design-run-button"
              onClick={run}
              disabled={running() || !input().trim()}
            >
              <span>
                {running() ? copy().running : status() === "done" ? copy().again : copy().run}
              </span>
              <span class="design-run-shortcut">⌘↵</span>
            </button>
          </div>
        </div>
        <div class="design-output-pane">
          <div
            class={["design-output-progress", { running: running() }]}
            style={{ "--progress": `${progress()}%` } as JSX.CSSProperties}
          />
          <div class="design-output-heading">
            <span class="design-output-label">{copy().output}</span>
            <span class={["design-output-status", status()]}>
              <span class="design-dot" aria-hidden="true" />
              {running() ? copy().stRun : status() === "done" ? copy().stDone : copy().stIdle}
            </span>
          </div>
          {/* The original result area preserves these line breaks; they also define its empty-state spacing. */}
          <div class="design-output" aria-live={running() ? "off" : "polite"}>
            {"\n              "}
            {output() && (
              <>
                {"\n                "}
                <span>{output()}</span>
                {running() && <span class="design-stream-cursor" aria-hidden="true" />}
                {"\n              "}
              </>
            )}
            {"\n              "}
            {!output() && (
              <>
                {"\n                "}
                <div class="design-output-empty">
                  <div class="design-output-empty-inner">
                    <span class="design-output-empty-diamond" aria-hidden="true" />
                    <span class="design-output-empty-copy">{copy().outEmpty}</span>
                  </div>
                </div>
                {"\n              "}
              </>
            )}
            {"\n            "}
          </div>
          <div class="design-pane-actions">
            <span class="design-pane-meta">
              {status() === "done"
                ? `${output().length} ${copy().outChars} · ${elapsed().toFixed(1)}${copy().sec}`
                : output()
                  ? `${output().length} ${copy().outChars}`
                  : "—"}
            </span>
            <button type="button" class="design-copy-button" onClick={() => void copyResult()}>
              {copied() ? copy().copied : copy().copy}
            </button>
          </div>
        </div>
      </div>
      {error() && (
        <p class="design-inline-error" role="alert">
          {error()}
        </p>
      )}
    </div>
  );
}
