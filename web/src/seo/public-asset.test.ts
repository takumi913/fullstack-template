import { describe, expect, it } from "vitest";
import { normalizePublicAssetPath } from "./public-asset";

describe("public asset path validation", () => {
  it("normalizes a root-relative public asset", () => {
    expect(normalizePublicAssetPath("/brand/og.png")).toBe("brand/og.png");
  });

  it("rejects non-root-relative asset paths", () => {
    expect(() => normalizePublicAssetPath("brand/og.png")).toThrow();
  });

  it("rejects query strings and hashes", () => {
    expect(() => normalizePublicAssetPath("/og.png?v=1")).toThrow();
    expect(() => normalizePublicAssetPath("/og.png#share")).toThrow();
  });

  it("prevents directory traversal outside public", () => {
    expect(() => normalizePublicAssetPath("/../secret.png")).toThrow();
    expect(() => normalizePublicAssetPath("/brand/../secret.png")).toThrow();
  });
});
