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
        expect(page.path.startsWith("/use-cases/"), page.path).toBe(true);
      }
      if (page.kind === "comparison") {
        expect(page.path.startsWith("/compare/"), page.path).toBe(true);
      }
      if (page.kind === "guide") {
        expect(page.path.startsWith("/guides/"), page.path).toBe(true);
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
