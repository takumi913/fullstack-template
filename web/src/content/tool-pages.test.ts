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
      expect(toolComponents[tool.componentKey], `${tool.slug} -> ${tool.componentKey}`).toBeDefined();
    }
  });

  it("keeps hreflang sets self-referencing and reciprocal", () => {
    const pagesByPath = new Map(routableToolPages.map((tool) => [toolPath(tool.slug), tool]));

    for (const tool of routableToolPages) {
      if (!tool.alternates?.length) continue;

      expect(tool.locale, `${tool.slug} locale`).toBeTruthy();

      const hreflangs = tool.alternates.map((alternate) => alternate.hreflang);
      expect(new Set(hreflangs).size, `${tool.slug} hreflang uniqueness`).toBe(hreflangs.length);
      expect(
        tool.alternates.some(
          (alternate) =>
            alternate.hreflang === tool.locale && alternate.path === toolPath(tool.slug),
        ),
        `${tool.slug} self hreflang`,
      ).toBe(true);

      for (const alternate of tool.alternates) {
        if (alternate.hreflang === "x-default") continue;

        const target = pagesByPath.get(alternate.path);
        expect(target, `${tool.slug} -> ${alternate.path}`).toBeDefined();
        expect(target?.locale).toBe(alternate.hreflang);
        expect(
          target?.alternates?.some(
            (backlink) =>
              backlink.hreflang === tool.locale && backlink.path === toolPath(tool.slug),
          ),
          `${alternate.path} -> ${toolPath(tool.slug)}`,
        ).toBe(true);
      }
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
