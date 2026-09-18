import { describe, expect, it } from "vitest";
import { routableToolPages, toolPages, toolPath } from "./tool-pages";
import { createToolSeoPage } from "../seo/tool-page";
import { isValidHreflang } from "../seo/localization";
import { toolComponents } from "../tools/registry";

describe("tool page definitions", () => {
  it("uses unique slugs and paths", () => {
    const slugs = toolPages.map((tool) => tool.slug);
    const paths = toolPages.map((tool) => toolPath(tool));

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("uses clean canonical URL paths", () => {
    for (const tool of routableToolPages) {
      const path = toolPath(tool);

      expect(path.startsWith("/"), tool.slug).toBe(true);
      expect(path.endsWith("/"), tool.slug).toBe(false);
      expect(path.includes("?"), tool.slug).toBe(false);
      expect(path.includes("#"), tool.slug).toBe(false);
      expect(/^\/(?:[A-Za-z0-9-]+\/)?tools\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path), path).toBe(true);
    }
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
      expect(
        toolComponents[tool.componentKey],
        `${tool.slug} -> ${tool.componentKey}`,
      ).toBeDefined();
    }
  });

  it("keeps hreflang sets self-referencing and reciprocal", () => {
    const pagesByPath = new Map(routableToolPages.map((tool) => [toolPath(tool), tool]));

    for (const tool of routableToolPages) {
      if (!tool.alternates?.length) continue;

      expect(tool.locale, `${tool.slug} locale`).toBeTruthy();

      const hreflangs = tool.alternates.map((alternate) => alternate.hreflang);
      expect(new Set(hreflangs).size, `${tool.slug} hreflang uniqueness`).toBe(hreflangs.length);
      for (const hreflang of hreflangs) {
        expect(isValidHreflang(hreflang), `${tool.slug} invalid hreflang: ${hreflang}`).toBe(true);
      }
      expect(
        tool.alternates.some(
          (alternate) => alternate.hreflang === tool.locale && alternate.path === toolPath(tool),
        ),
        `${tool.slug} self hreflang`,
      ).toBe(true);

      for (const alternate of tool.alternates) {
        const target = pagesByPath.get(alternate.path);

        if (alternate.hreflang === "x-default") {
          expect(target, `${tool.slug} x-default -> ${alternate.path}`).toBeDefined();
          continue;
        }
        expect(target, `${tool.slug} -> ${alternate.path}`).toBeDefined();
        expect(target?.locale).toBe(alternate.hreflang);
        expect(
          target?.alternates?.some(
            (backlink) => backlink.hreflang === tool.locale && backlink.path === toolPath(tool),
          ),
          `${alternate.path} -> ${toolPath(tool)}`,
        ).toBe(true);
      }
    }
  });

  it("keeps localized URL prefixes aligned with locale metadata", () => {
    for (const tool of routableToolPages) {
      const path = toolPath(tool);
      const localizedMatch = path.match(/^\/([^/]+)\/tools\//);

      if (localizedMatch) {
        expect(tool.locale, `${tool.slug} locale`).toBe(localizedMatch[1]);
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
