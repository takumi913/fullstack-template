import { For, lazy, Loading, type Component, type Element } from "solid-js";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { useTranslation } from "@/i18n/context";
import { ToolPageProvider } from "./context";

type ToolComponent = Component<{ navigation?: Element }>;

export const toolComponents: Record<string, ToolComponent> = {
  // 保留直接 import，让构建器为 SSR 与 hydration 记录同一模块的预载信息。
  "ai-text": lazy(() => import("./TextWorkbench"), { export: "TextWorkbench" }),
  "json-formatter": lazy(() => import("./JsonFormatterTool"), { export: "JsonFormatterTool" }),
  "word-counter": lazy(() => import("./WordCounterTool"), { export: "WordCounterTool" }),
};

export function ToolRuntime(props: { page: ToolPageDefinition; navigation?: Element }) {
  const { t } = useTranslation();
  return (
    <For each={[props.page]}>
      {(page) => {
        const Tool = toolComponents[page.componentKey];
        return (
          <ToolPageProvider page={page}>
            <Loading
              fallback={
                <div class="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
                  {t("actions.loading")}
                </div>
              }
            >
              {Tool ? (
                <Tool navigation={props.navigation} />
              ) : (
                <div class="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
                  Register <code>{page.componentKey}</code> in <code>src/tools/registry.tsx</code>.
                </div>
              )}
            </Loading>
          </ToolPageProvider>
        );
      }}
    </For>
  );
}
