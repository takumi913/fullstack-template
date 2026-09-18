import { describe, expect, it } from "vitest";
import { routableToolPages, toolPages, toolPath } from "./tool-pages";
import { createToolSeoPage } from "../seo/tool-page";
import { toolComponents } from "../tools/registry";

describe("tool page definitions", () => {
  it("uses unique slugs and paths", () => {
    const slugs = toolPages.map((tool) => tool.slug);
    const paths = toolPages.map((tool) => toolPath(tool.slug));

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("only references existing related tools", () => {
    const knownSlugs = new Set(toolPages.map((tool) => tool.slug));

    for (const tool of toolPages) {
      for (const relatedSlug of tool.relatedSlugs) {
        expect(knownSlugs.has(relatedSlug), `${tool.slug} -> ${relatedSlug}`).toBe(true);
        expect(relatedSlug).not.toBe(tool.slug);
      }
    }
  });

  it("registers a React implementation for every routable tool", () => {
    for (const tool of routableToolPages) {
      expect(toolComponents[tool.slug], tool.slug).toBeDefined();
    }
  });

  it("keeps example pages out of the index by default", () => {
    for (const tool of routableToolPages.filter((item) => item.status === "example")) {
      expect(createToolSeoPage(tool).noindex).toBe(true);
    }
  });

  it("requires published tools to be indexable unless explicitly disabled", () => {
    for (const tool of routableToolPages.filter((item) => item.status === "published")) {
      expect(createToolSeoPage(tool).noindex).toBe(Boolean(tool.noindex));
    }
  });
});
