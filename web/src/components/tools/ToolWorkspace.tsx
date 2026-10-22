import { createSignal, type Element } from "solid-js";
import { Check, Copy } from "@lucide/solid";
import { useTranslation } from "@/i18n/context";
import { createAsyncAction } from "@/lib/createAsyncAction";

interface ToolWorkspaceProps {
  navigation: Element;
  options?: Element;
  input: Element;
  inputLength: number;
  output: string;
  result?: Element;
  error?: string;
  onSample: () => void;
  onClear: () => void;
  onRun?: () => void;
}

export function ToolWorkspace(props: ToolWorkspaceProps) {
  const { t } = useTranslation();
  const [copiedValue, setCopiedValue] = createSignal<string | null>(null);
  const { error: copyError, pending, run } = createAsyncAction();
  const copied = () => copiedValue() === props.output && props.output.length > 0;
  async function copyOutput() {
    const output = props.output;
    const ok = await run(() => navigator.clipboard.writeText(output));
    if (ok) setCopiedValue(output);
  }
  return (
    <div class="tool-workspace">
      <div class="tool-toolbar">
        {props.navigation}
        <div class="tool-options">{props.options}</div>
      </div>
      <div class="tool-columns">
        <div class="tool-input-pane">
          {props.input}
          <div class="tool-pane-footer">
            <span class="tool-meta">
              {props.inputLength.toLocaleString()} {t("counter.characters").toLowerCase()}
            </span>
            <button type="button" class="button-subtle" onClick={() => props.onSample()}>
              {t("workbench.sample")}
            </button>
            <button type="button" class="button-subtle" onClick={() => props.onClear()}>
              {t("workbench.clear")}
            </button>
            {props.onRun && (
              <button
                type="button"
                class="button-primary"
                onClick={props.onRun}
                disabled={!props.inputLength}
              >
                {t("workbench.run")}
                <span class="font-mono text-xs opacity-60" aria-hidden="true">
                  ⌘↵
                </span>
              </button>
            )}
          </div>
        </div>
        <div class="tool-output-pane">
          <div class="tool-output-label">
            <span>{t("workbench.result").toUpperCase()}</span>
            <span class="inline-flex items-center gap-2">
              <span
                class={["status-dot", { active: Boolean(props.output && !props.error) }]}
                aria-hidden="true"
              />
              {props.output && !props.error
                ? t(props.onRun ? "workbench.done" : "workbench.live")
                : t("workbench.waiting")}
            </span>
          </div>
          <div class="tool-result" aria-live="polite" aria-atomic="true">
            {props.error ? (
              <p class="tool-error" role="alert">
                {props.error}
              </p>
            ) : (
              (props.result ??
              (props.output ? (
                <pre>{props.output}</pre>
              ) : (
                <div class="tool-empty">
                  <span class="empty-mark" aria-hidden="true" />
                  <p>
                    {t("workbench.empty")}
                    <br />
                    {t("workbench.hint")}
                  </p>
                </div>
              )))
            )}
          </div>
          {copyError() && (
            <p class="tool-error px-6 pb-3" role="alert">
              {copyError()}
            </p>
          )}
          <div class="tool-pane-footer">
            <span class="tool-meta">{t("workbench.local")}</span>
            <button
              type="button"
              class="button-secondary"
              onClick={() => void copyOutput()}
              disabled={!props.output || Boolean(props.error) || pending()}
            >
              {copied() ? <Check size={14} /> : <Copy size={14} />}
              {t(copied() ? "workbench.copied" : "workbench.copy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
