import { describe, expect, it } from "vitest";
import { assertSeoBuildSiteUrl, normalizeSiteUrl, placeholderSiteUrl } from "./site-url";

describe("site URL validation", () => {
  it("normalizes a valid origin", () => {
    expect(normalizeSiteUrl("https://example.org/")).toBe("https://example.org");
  });

  it("rejects site URLs with a path", () => {
    expect(() => normalizeSiteUrl("https://example.org/app")).toThrow(
      "VITE_SITE_URL must be an origin without a path",
    );
  });

  it("requires a production-style hostname in strict mode", () => {
    expect(() => assertSeoBuildSiteUrl(undefined, true)).toThrow();
    expect(() => assertSeoBuildSiteUrl(placeholderSiteUrl, true)).toThrow();

    for (const url of [
      "http://localhost:5173",
      "https://preview.localhost",
      "https://template.example",
      "https://project.test",
      "https://project.invalid",
      "https://tools.example.com",
      "https://tools.example.net",
      "https://tools.example.org",
      "http://127.0.0.1:5173",
    ]) {
      expect(() => assertSeoBuildSiteUrl(url, true), url).toThrow();
    }

    expect(assertSeoBuildSiteUrl("https://tools.acme.dev", true)).toBe("https://tools.acme.dev");
  });

  it("still allows placeholder and local URLs outside strict production mode", () => {
    expect(assertSeoBuildSiteUrl("http://localhost:5173", false)).toBe("http://localhost:5173");
    expect(assertSeoBuildSiteUrl(placeholderSiteUrl, false)).toBe(placeholderSiteUrl);
  });
});
