import { describe, expect, it } from "vitest";
import type { ToolPageDefinition } from "./tool-pages";
import { resolveHomepageTool } from "./homepage-tool";

const publishedTool: ToolPageDefinition = {
  slug: "primary-tool",
  componentKey: "primary-tool",
  status: "published",
  name: "Primary Tool",
  category: "Utility",
  primaryKeyword: "primary tool",
  title: "Primary Tool Online",
  description: "A real primary tool used to verify homepage tool configuration behavior.",
  h1: "Primary Tool",
  intro: "Use the primary tool directly.",
  features: ["Feature"],
  howToSteps: ["Use it."],
  faq: [],
  relatedSlugs: [],
  updatedAt: "2026-09-18",
};

describe("homepage tool configuration", () => {
  it("returns undefined when the homepage has no primary tool", () => {
    expect(resolveHomepageTool(null, [publishedTool])).toBeUndefined();
  });

  it("returns the configured routable tool", () => {
    expect(resolveHomepageTool("primary-tool", [publishedTool])).toBe(publishedTool);
  });

  it("rejects an unknown primary tool slug", () => {
    expect(() => resolveHomepageTool("missing", [publishedTool])).toThrow(/does not match/);
  });

  it("rejects a draft primary tool", () => {
    expect(() =>
      resolveHomepageTool("primary-tool", [{ ...publishedTool, status: "draft" }]),
    ).toThrow(/draft tool/);
  });
});
