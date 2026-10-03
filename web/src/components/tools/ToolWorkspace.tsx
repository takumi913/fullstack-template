import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAsyncAction } from "@/lib/useAsyncAction";

interface ToolWorkspaceProps {
  navigation: ReactNode;
  options?: ReactNode;
  input: ReactNode;
  inputLength: number;
  output: string;
  result?: ReactNode;
  error?: string;
  onSample: () => void;
  onClear: () => void;
  onRun?: () => void;
}

export function ToolWorkspace({
  navigation,
  options,
  input,
  inputLength,
  output,
  result,
  error,
  onSample,
  onClear,
  onRun,
}: ToolWorkspaceProps) {
  const { t } = useTranslation();
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const { error: copyError, pending, run } = useAsyncAction();
  const copied = copiedValue === output && output.length > 0;
  async function copyOutput() {
    const ok = await run(() => navigator.clipboard.writeText(output));
    if (ok) setCopiedValue(output);
  }
  return (
    <div className="tool-workspace">
      <div className="tool-toolbar">
        {navigation}
        <div className="tool-options">{options}</div>
      </div>
      <div className="tool-columns">
        <div className="tool-input-pane">
          {input}
          <div className="tool-pane-footer">
            <span className="tool-meta">
              {inputLength.toLocaleString()} {t("counter.characters").toLowerCase()}
            </span>
            <button type="button" className="button-subtle" onClick={onSample}>
              {t("workbench.sample")}
            </button>
            <button type="button" className="button-subtle" onClick={onClear}>
              {t("workbench.clear")}
            </button>
            {onRun && (
              <button
                type="button"
                className="button-primary"
                onClick={onRun}
                disabled={!inputLength}
              >
                {t("workbench.run")}
                <span className="font-mono text-xs opacity-60" aria-hidden="true">
                  ⌘↵
                </span>
              </button>
            )}
          </div>
        </div>
        <div className="tool-output-pane">
          <div className="tool-output-label">
            <span>{t("workbench.result").toUpperCase()}</span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`status-dot ${output && !error ? "active" : ""}`}
                aria-hidden="true"
              />
              {output && !error
                ? t(onRun ? "workbench.done" : "workbench.live")
                : t("workbench.waiting")}
            </span>
          </div>
          <div className="tool-result" aria-live="polite" aria-atomic="true">
            {error ? (
              <p className="tool-error" role="alert">
                {error}
              </p>
            ) : (
              (result ??
              (output ? (
                <pre>{output}</pre>
              ) : (
                <div className="tool-empty">
                  <span className="empty-mark" aria-hidden="true" />
                  <p>
                    {t("workbench.empty")}
                    <br />
                    {t("workbench.hint")}
                  </p>
                </div>
              )))
            )}
          </div>
          {copyError && (
            <p className="tool-error px-6 pb-3" role="alert">
              {copyError}
            </p>
          )}
          <div className="tool-pane-footer">
            <span className="tool-meta">{t("workbench.local")}</span>
            <button
              type="button"
              className="button-secondary"
              onClick={() => void copyOutput()}
              disabled={!output || Boolean(error) || pending}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {t(copied ? "workbench.copied" : "workbench.copy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
