import type { ComponentType } from "react";
import { JsonFormatterTool } from "./JsonFormatterTool";
import { WordCounterTool } from "./WordCounterTool";

export const toolComponents: Record<string, ComponentType> = {
  "json-formatter": JsonFormatterTool,
  "word-counter": WordCounterTool,
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

  return <Component />;
}
