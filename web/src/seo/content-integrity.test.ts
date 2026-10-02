import { describe, expect, it } from "vitest";
import { routableLandingPages } from "../content/landing-pages";
import { routableToolPages } from "../content/tool-pages";
import { createLandingSeoPage } from "./landing-page";
import { legalPages } from "../content/legal-pages";
import { allPublicSeoPages, getPublicSeoPages } from "./pages";
import type { SeoPage } from "./page";
import { createToolSeoPage } from "./tool-page";

function normalizeKeyword(value: string) {
  return value.trim().toLocaleLowerCase();
}

function indexable(pages: SeoPage[]) {
  return pages.filter((page) => !page.noindex);
}

describe("SEO content integrity", () => {
  const staticPages = allPublicSeoPages;
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

  it("declares only existing, reciprocal language versions with self references", () => {
    const byPath = new Map(allPages.map((page) => [page.path, page]));
    for (const page of allPages) {
      const languages = (page.alternates || []).filter((item) => item.hreflang !== "x-default");
      expect(
        languages.some((item) => item.path === page.path),
        page.path,
      ).toBe(true);
      for (const alternate of languages) {
        const target = byPath.get(alternate.path);
        expect(target?.locale, alternate.path).toBe(alternate.hreflang);
        expect(
          target?.alternates?.some((item) => item.path === page.path),
          `${page.path} reciprocal`,
        ).toBe(true);
      }
      expect(
        page.alternates?.find((item) => item.hreflang === "x-default")?.path,
        page.path,
      ).not.toMatch(/^\/zh-cn/);
    }
  });

  it("excludes draft policies from published policy alternate targets", () => {
    const status = legalPages.en.privacy.status;
    legalPages.en.privacy.status = "published";
    try {
      expect(getPublicSeoPages("en").privacy.noindex).toBe(false);
      expect(getPublicSeoPages("en").privacy.alternates?.map((item) => item.path)).toEqual([
        "/legal/privacy-policy",
        "/legal/privacy-policy",
      ]);
      expect(getPublicSeoPages("zh-CN").privacy.noindex).toBe(true);
      expect(getPublicSeoPages("zh-CN").privacy.alternates).toEqual([
        { hreflang: "zh-CN", path: "/zh-cn/legal/privacy-policy" },
      ]);
    } finally {
      legalPages.en.privacy.status = status;
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
