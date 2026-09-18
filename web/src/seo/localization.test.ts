import { describe, expect, it } from "vitest";
import { createHreflangAlternates } from "./localization";

describe("createHreflangAlternates", () => {
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
