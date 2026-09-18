import type { LandingPageDefinition } from "../content/landing-pages";
import type { ToolPageDefinition } from "../content/tool-pages";
import { scaffoldSentinels } from "../config/scaffold-sentinels";

export interface ProductionReadinessOptions {
  strict: boolean;
  allowTemplateExamples?: boolean;
  tools: readonly ToolPageDefinition[];
  landings: readonly LandingPageDefinition[];
}

function toolPath(tool: ToolPageDefinition) {
  return tool.path || `/tools/${tool.slug}`;
}

function containsScaffoldBrand(value: string) {
  return value.toLocaleLowerCase().includes(scaffoldSentinels.name.toLocaleLowerCase());
}

export function assertProductionContentReady({
  strict,
  allowTemplateExamples = false,
  tools,
  landings,
}: ProductionReadinessOptions) {
  if (!strict) return;

  if (!allowTemplateExamples) {
    const examples = [
      ...tools
        .filter(
          (tool) => tool.status === "example" || (tool.templateExample && tool.status !== "draft"),
        )
        .map((tool) => toolPath(tool)),
      ...landings
        .filter(
          (page) => page.status === "example" || (page.templateExample && page.status !== "draft"),
        )
        .map((page) => page.path),
    ];

    if (examples.length > 0) {
      throw new Error(
        `SEO_STRICT=true does not allow template example content: ${examples.join(", ")}. Remove it, mark it draft, or replace it with real content and remove templateExample. Use SEO_ALLOW_TEMPLATE_EXAMPLES=true only for template CI/testing.`,
      );
    }
  }

  const stalePublishedContent = [
    ...tools
      .filter((tool) => tool.status === "published")
      .filter((tool) =>
        [tool.title, tool.description, tool.h1, tool.intro].some(containsScaffoldBrand),
      )
      .map((tool) => toolPath(tool)),
    ...landings
      .filter((page) => page.status === "published")
      .filter((page) =>
        [page.title, page.description, page.h1, page.intro].some(containsScaffoldBrand),
      )
      .map((page) => page.path),
  ];

  if (stalePublishedContent.length > 0) {
    throw new Error(
      `Published SEO content still contains the scaffold brand "${scaffoldSentinels.name}": ${stalePublishedContent.join(", ")}.`,
    );
  }
}
