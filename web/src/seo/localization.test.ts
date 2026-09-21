import { describe, expect, it } from "vitest";
import { createHreflangAlternates, isValidHreflang } from "./localization";

describe("hreflang helpers", () => {
  it("accepts valid locale tags and x-default", () => {
    for (const value of ["en", "ja", "en-US", "zh-Hans", "x-default"]) {
      expect(isValidHreflang(value), value).toBe(true);
    }
  });

  it("rejects malformed locale tags", () => {
    for (const value of ["en_US", "en--US", "", "not a locale!"]) {
      expect(isValidHreflang(value), value).toBe(false);
    }
  });

  it("includes every locale and an optional x-default", () => {
    expect(
      createHreflangAlternates(
        [
          { locale: "en", path: "/en/tools/image-translator" },
          { locale: "ja", path: "/ja/tools/image-translator" },
        ],
        "/tools/image-translator",
      ),
    ).toEqual([
      { hreflang: "en", path: "/en/tools/image-translator" },
      { hreflang: "ja", path: "/ja/tools/image-translator" },
      { hreflang: "x-default", path: "/tools/image-translator" },
    ]);
  });
});
