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

  it("requires a real URL in strict mode", () => {
    expect(() => assertSeoBuildSiteUrl(undefined, true)).toThrow();
    expect(() => assertSeoBuildSiteUrl(placeholderSiteUrl, true)).toThrow();
    expect(assertSeoBuildSiteUrl("https://tools.example.org", true)).toBe(
      "https://tools.example.org",
    );
  });
});
