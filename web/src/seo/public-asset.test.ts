import { describe, expect, it } from "vitest";
import { resolvePublicAssetPath } from "./public-asset";

describe("public asset path validation", () => {
  it("resolves a normal root-relative public asset", () => {
    expect(resolvePublicAssetPath("/app/web/public", "/brand/og.png")).toBe(
      "/app/web/public/brand/og.png",
    );
  });

  it("rejects non-root-relative asset paths", () => {
    expect(() => resolvePublicAssetPath("/app/web/public", "brand/og.png")).toThrow();
  });

  it("rejects query strings and hashes", () => {
    expect(() => resolvePublicAssetPath("/app/web/public", "/og.png?v=1")).toThrow();
    expect(() => resolvePublicAssetPath("/app/web/public", "/og.png#share")).toThrow();
  });

  it("prevents directory traversal outside public", () => {
    expect(() => resolvePublicAssetPath("/app/web/public", "/../secret.png")).toThrow();
  });
});
