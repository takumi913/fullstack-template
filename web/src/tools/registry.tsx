import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";

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

export function ToolRuntime({ slug }: { slug: string }) {
  const Component = toolComponents[slug];

  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-sm text-zinc-500">
        Register this tool&apos;s React component in <code>src/tools/registry.tsx</code>.
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="rounded-xl border bg-zinc-50 p-8 text-sm text-zinc-500">Loading tool…</div>
      }
    >
      <Component />
    </Suspense>
  );
}
