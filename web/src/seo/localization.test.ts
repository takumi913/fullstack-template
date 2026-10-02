import { describe, expect, it } from "vitest";
import {
  createHreflangAlternates,
  createContentHreflangAlternates,
  isValidHreflang,
} from "./localization";

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
  it("keeps publication states out of each other’s hreflang families", () => {
    const variants = [
      { locale: "en", path: "/tools/task", status: "published" },
      { locale: "zh-CN", path: "/zh-cn/tools/task", status: "example" },
      { locale: "fr", path: "/fr/tools/task", status: "draft" },
    ];
    expect(createContentHreflangAlternates(variants[0]!, variants)).toEqual([
      { hreflang: "en", path: "/tools/task" },
      { hreflang: "x-default", path: "/tools/task" },
    ]);
    expect(createContentHreflangAlternates(variants[1]!, variants)).toEqual([
      { hreflang: "zh-CN", path: "/zh-cn/tools/task" },
    ]);
  });
});
