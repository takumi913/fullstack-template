import { describe, expect, it } from "vitest";
import { landingPages, routableLandingPages } from "./landing-pages";
import { getToolPageBySlug } from "./tool-pages";
import { createLandingSeoPage } from "../seo/landing-page";

describe("landing page definitions", () => {
  it("uses unique slugs and canonical paths", () => {
    const slugs = landingPages.map((page) => page.slug);
    const paths = landingPages.map((page) => page.path);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("uses clean paths that match the declared kind", () => {
    for (const page of routableLandingPages) {
      expect(page.path.startsWith("/"), page.slug).toBe(true);
      expect(page.path.endsWith("/"), page.slug).toBe(false);
      expect(page.path.includes("?"), page.slug).toBe(false);
      expect(page.path.includes("#"), page.slug).toBe(false);

      if (page.kind === "use-case") {
        expect(
          /^\/(?:[A-Za-z0-9-]+\/)?use-cases\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.path),
          page.path,
        ).toBe(true);
      }
      if (page.kind === "comparison") {
        expect(
          /^\/(?:[A-Za-z0-9-]+\/)?compare\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.path),
          page.path,
        ).toBe(true);
      }
      if (page.kind === "guide") {
        expect(
          /^\/(?:[A-Za-z0-9-]+\/)?guides\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.path),
          page.path,
        ).toBe(true);
      }
    }
  });

  it("keeps localized URL prefixes aligned with locale metadata", () => {
    for (const page of routableLandingPages) {
      const localizedMatch = page.path.match(/^\/([^/]+)\/(?:use-cases|compare|guides)\//);

      if (localizedMatch) {
        expect(page.locale, `${page.slug} locale`).toBe(localizedMatch[1]);
      }
    }
  });

  it("keeps hreflang sets self-referencing and reciprocal", () => {
    const pagesByPath = new Map(routableLandingPages.map((page) => [page.path, page]));

    for (const page of routableLandingPages) {
      if (!page.alternates?.length) continue;

      expect(page.locale, `${page.slug} locale`).toBeTruthy();

      const hreflangs = page.alternates.map((alternate) => alternate.hreflang);
      expect(new Set(hreflangs).size, `${page.slug} hreflang uniqueness`).toBe(hreflangs.length);
      expect(
        page.alternates.some(
          (alternate) => alternate.hreflang === page.locale && alternate.path === page.path,
        ),
        `${page.slug} self hreflang`,
      ).toBe(true);

      for (const alternate of page.alternates) {
        const target = pagesByPath.get(alternate.path);

        if (alternate.hreflang === "x-default") {
          expect(target, `${page.slug} x-default -> ${alternate.path}`).toBeDefined();
          continue;
        }

        expect(target, `${page.slug} -> ${alternate.path}`).toBeDefined();
        expect(target?.locale).toBe(alternate.hreflang);
        expect(
          target?.alternates?.some(
            (backlink) => backlink.hreflang === page.locale && backlink.path === page.path,
          ),
          `${alternate.path} -> ${page.path}`,
        ).toBe(true);
      }
    }
  });

  it("only references existing tool pages", () => {
    for (const page of routableLandingPages) {
      for (const slug of page.relatedToolSlugs) {
        expect(getToolPageBySlug(slug), `${page.slug} -> ${slug}`).toBeDefined();
      }
    }
  });

  it("keeps every routable resource discoverable from the directory unless hidden", async () => {
    const module = await import("./landing-pages");

    for (const page of module.routableLandingPages) {
      if (page.showInDirectory === false) continue;
      expect(module.directoryLandingPages).toContain(page);
    }
  });

  it("keeps example landing pages out of the index", () => {
    for (const page of routableLandingPages.filter((item) => item.status === "example")) {
      expect(createLandingSeoPage(page).noindex).toBe(true);
    }
  });

  it("keeps published landing pages indexable unless explicitly disabled", () => {
    for (const page of routableLandingPages.filter((item) => item.status === "published")) {
      expect(createLandingSeoPage(page).noindex).toBe(Boolean(page.noindex));
    }
  });
});
