import { toolPages, type ToolPageDefinition } from "./tool-pages";

export function resolveHomepageTool(
  slug: string | null | undefined,
  tools: readonly ToolPageDefinition[] = toolPages,
) {
  if (!slug) return undefined;

  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) {
    throw new Error(`Configured home.primaryToolSlug "${slug}" does not match any tool definition`);
  }
  if (tool.status === "draft") {
    throw new Error(`Configured home.primaryToolSlug "${slug}" points to a draft tool`);
  }

  return tool;
}
