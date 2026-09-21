import { describe, expect, it } from "vitest";
import { routableLandingPages } from "../content/landing-pages";
import { routableToolPages } from "../content/tool-pages";
import { createLandingSeoPage } from "./landing-page";
import { publicSeoPages } from "./pages";
import type { SeoPage } from "./page";
import { createToolSeoPage } from "./tool-page";

function normalizeKeyword(value: string) {
  return value.trim().toLocaleLowerCase();
}

function indexable(pages: SeoPage[]) {
  return pages.filter((page) => !page.noindex);
}

describe("SEO content integrity", () => {
  const staticPages = Object.values(publicSeoPages);
  const toolPages = routableToolPages.map(createToolSeoPage);
  const landingPages = routableLandingPages.map(createLandingSeoPage);
  const allPages: SeoPage[] = [...staticPages, ...toolPages, ...landingPages];

  it("never assigns the same canonical path to two content definitions", () => {
    const paths = allPages.map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps indexable primary keywords unique", () => {
    const keywords = indexable(allPages).map((page) => normalizeKeyword(page.primaryKeyword));
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("keeps indexable titles unique", () => {
    const titles = indexable(allPages).map((page) => page.title.trim().toLocaleLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("requires indexable hreflang targets to also be indexable", () => {
    const pagesByPath = new Map(allPages.map((page) => [page.path, page]));

    for (const page of indexable(allPages)) {
      for (const alternate of page.alternates || []) {
        const target = pagesByPath.get(alternate.path);
        expect(target, `${page.path} -> ${alternate.path}`).toBeDefined();
        expect(target?.noindex, `${page.path} -> ${alternate.path}`).not.toBe(true);
      }
    }
  });

  it("requires indexable pages to have meaningful SEO fields", () => {
    for (const page of indexable(allPages)) {
      expect(page.primaryKeyword.trim().length, page.path).toBeGreaterThan(1);
      expect(page.title.trim().length, page.path).toBeGreaterThan(10);
      expect(page.description.trim().length, page.path).toBeGreaterThan(30);
      expect(page.h1.trim().length, page.path).toBeGreaterThan(2);
    }
  });
});
