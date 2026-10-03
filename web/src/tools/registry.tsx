import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { useTranslation } from "react-i18next";
import { ToolPageProvider } from "./context";

type ToolComponent = LazyExoticComponent<ComponentType<{ navigation?: ReactNode }>>;

export const toolComponents: Record<string, ToolComponent> = {
  "ai-text": lazy(async () => {
    const module = await import("./TextWorkbench");
    return { default: module.TextWorkbench };
  }),
  "json-formatter": lazy(async () => {
    const module = await import("./JsonFormatterTool");
    return { default: module.JsonFormatterTool };
  }),
  "word-counter": lazy(async () => {
    const module = await import("./WordCounterTool");
    return { default: module.WordCounterTool };
  }),
};

export function ToolRuntime({
  page,
  navigation,
}: {
  page: ToolPageDefinition;
  navigation?: ReactNode;
}) {
  const { t } = useTranslation();
  const Component = toolComponents[page.componentKey];

  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
        Register <code>{page.componentKey}</code> in <code>src/tools/registry.tsx</code>.
      </div>
    );
  }

  return (
    <ToolPageProvider page={page}>
      <Suspense
        fallback={
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            {t("actions.loading")}
          </div>
        }
      >
        <Component navigation={navigation} />
      </Suspense>
    </ToolPageProvider>
  );
}
