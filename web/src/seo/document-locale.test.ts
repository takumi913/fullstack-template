import { describe, expect, it } from "vitest";
import { resolveDocumentLocale } from "./document-locale";
import { siteConfig } from "./site";

describe("resolveDocumentLocale", () => {
  it("uses the tool page locale for tool routes", () => {
    expect(resolveDocumentLocale("/tools/json-formatter")).toBe("en");
  });

  it("uses the configured site locale for ordinary routes", () => {
    expect(resolveDocumentLocale("/")).toBe(siteConfig.locale);
  });
});
