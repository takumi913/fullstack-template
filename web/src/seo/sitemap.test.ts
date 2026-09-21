import { describe, expect, it } from "vitest";
import type { SeoPage } from "./page";
import { createSitemapXml } from "./sitemap";

function page(path: string, locale: string): SeoPage {
  return {
    path,
    locale,
    primaryKeyword: `${locale} example`,
    title: `${locale} example page title`,
    description: "A sufficiently descriptive localized page used to test sitemap generation.",
    h1: `${locale} example`,
    intent: "informational",
    updatedAt: "2026-09-18",
    alternates: [
      { hreflang: "en", path: "/guides/example" },
      { hreflang: "ja", path: "/ja/guides/example" },
      { hreflang: "x-default", path: "/guides/example" },
    ],
  };
}

describe("createSitemapXml", () => {
  it("emits reciprocal hreflang links for localized pages", () => {
    const xml = createSitemapXml("https://tools.example.dev", [
      page("/guides/example", "en"),
      page("/ja/guides/example", "ja"),
    ]);

    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain("<loc>https://tools.example.dev/guides/example</loc>");
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="ja" href="https://tools.example.dev/ja/guides/example" />',
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://tools.example.dev/guides/example" />',
    );
  });

  it("rejects hreflang targets that are not included in the indexable sitemap set", () => {
    expect(() =>
      createSitemapXml("https://tools.example.dev", [page("/guides/example", "en")]),
    ).toThrow(/must be indexable and included/);
  });

  it("rejects malformed, impossible, and future lastmod values", () => {
    const standalone = page("/guides/standalone", "en");
    standalone.alternates = undefined;

    standalone.updatedAt = "09/18/2026";
    expect(() =>
      createSitemapXml("https://tools.example.dev", [standalone], new Date("2026-09-19T00:00:00Z")),
    ).toThrow(/YYYY-MM-DD/);

    standalone.updatedAt = "2026-02-30";
    expect(() =>
      createSitemapXml("https://tools.example.dev", [standalone], new Date("2026-09-19T00:00:00Z")),
    ).toThrow(/valid calendar date/);

    standalone.updatedAt = "2026-09-20";
    expect(() =>
      createSitemapXml("https://tools.example.dev", [standalone], new Date("2026-09-19T23:59:59Z")),
    ).toThrow(/cannot be in the future/);
  });

  it("accepts today's date as a valid lastmod", () => {
    const standalone = page("/guides/standalone", "en");
    standalone.alternates = undefined;
    standalone.updatedAt = "2026-09-19";

    expect(
      createSitemapXml("https://tools.example.dev", [standalone], new Date("2026-09-19T12:00:00Z")),
    ).toContain("<lastmod>2026-09-19</lastmod>");
  });

  it("does not add the xhtml namespace when no page has alternates", () => {
    const standalone = page("/guides/standalone", "en");
    standalone.alternates = undefined;

    expect(createSitemapXml("https://tools.example.dev", [standalone])).not.toContain(
      "xmlns:xhtml",
    );
  });
});
