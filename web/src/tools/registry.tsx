import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { ToolPageProvider } from "./context";

type ToolComponent = LazyExoticComponent<ComponentType>;

export const toolComponents: Record<string, ToolComponent> = {
  "json-formatter": lazy(async () => {
    const module = await import("./JsonFormatterTool");
    return { default: module.JsonFormatterTool };
  }),
  "word-counter": lazy(async () => {
    const module = await import("./WordCounterTool");
    return { default: module.WordCounterTool };
  }),
};

export function ToolRuntime({ page }: { page: ToolPageDefinition }) {
  const Component = toolComponents[page.componentKey];

  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-sm text-zinc-500">
        Register <code>{page.componentKey}</code> in <code>src/tools/registry.tsx</code>.
      </div>
    );
  }

  return (
    <ToolPageProvider page={page}>
      <Suspense
        fallback={
          <div className="rounded-xl border bg-zinc-50 p-8 text-sm text-zinc-500">Loading tool…</div>
        }
      >
        <Component />
      </Suspense>
    </ToolPageProvider>
  );
}
