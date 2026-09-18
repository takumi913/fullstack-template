import { describe, expect, it } from "vitest";
import { createSeoMeta, type SeoPage } from "./page";
import { absoluteUrl } from "./site";

describe("createSeoMeta", () => {
  it("emits locale and fully qualified hreflang links when alternates exist", () => {
    const page: SeoPage = {
      path: "/en/tool",
      primaryKeyword: "example tool",
      title: "Example Tool",
      description: "Example description",
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

    expect(meta).toContainEqual({ property: "og:locale", content: "en" });
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
  });
});
