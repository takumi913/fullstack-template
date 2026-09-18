import { describe, expect, it } from "vitest";
import { createSeoMeta, notFoundPageMeta, type SeoPage } from "./page";
import { absoluteUrl, siteConfig } from "./site";

const basePage: SeoPage = {
  path: "/example",
  primaryKeyword: "example",
  title: "Example",
  description: "Example description",
  h1: "Example",
  intent: "informational",
};

describe("createSeoMeta", () => {
  it("uses the configured site brand for not-found titles", () => {
    expect(notFoundPageMeta("Tool not found")).toContainEqual({
      title: `Tool not found | ${siteConfig.name}`,
    });
  });

  it("keeps public noindex pages crawlable", () => {
    const meta = createSeoMeta({ ...basePage, noindex: true });

    expect(meta).toContainEqual({
      name: "robots",
      content: "noindex, follow",
    });
  });

  it("supports explicit nofollow for private-style pages", () => {
    const meta = createSeoMeta({ ...basePage, noindex: true, nofollow: true });

    expect(meta).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    });
  });

  it("emits an absolute canonical URL", () => {
    const meta = createSeoMeta(basePage);

    expect(meta).toContainEqual({
      tagName: "link",
      rel: "canonical",
      href: absoluteUrl("/example"),
    });
  });

  it("emits locale and fully qualified hreflang links when alternates exist", () => {
    const page: SeoPage = {
      ...basePage,
      path: "/en/tool",
      primaryKeyword: "example tool",
      title: "Example Tool",
      h1: "Example Tool",
      intent: "tool",
      locale: "en",
      alternates: [
        { hreflang: "en", path: "/en/tool" },
        { hreflang: "ja", path: "/ja/tool" },
        { hreflang: "x-default", path: "/tool" },
      ],
    };

    const meta = createSeoMeta(page);

    expect(meta).toContainEqual({ property: "og:locale", content: "en_US" });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "ja",
      href: absoluteUrl("/ja/tool"),
    });
    expect(meta).toContainEqual({
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: absoluteUrl("/tool"),
    });
    expect(meta).toContainEqual({
      property: "og:locale:alternate",
      content: "ja_JP",
    });
  });
});
