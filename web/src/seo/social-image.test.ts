import { describe, expect, it } from "vitest";
import { assertProductionSocialImage } from "./social-image";

describe("production social image validation", () => {
  it("accepts raster public assets in strict mode", () => {
    for (const imagePath of ["/og-image.png", "/og-image.jpg", "/og-image.jpeg"]) {
      expect(() =>
        assertProductionSocialImage({
          strict: true,
          imagePath,
        }),
      ).not.toThrow();
    }
  });

  it("rejects SVG social images in strict production mode", () => {
    expect(() =>
      assertProductionSocialImage({
        strict: true,
        imagePath: "/og-image.svg",
      }),
    ).toThrow(/raster social image/);
  });

  it("allows SVG only when explicitly enabled for template testing", () => {
    expect(() =>
      assertProductionSocialImage({
        strict: true,
        allowSvgSocialImage: true,
        imagePath: "/og-image.svg",
      }),
    ).not.toThrow();
  });

  it("rejects unsupported or non-local image paths in strict mode", () => {
    expect(() =>
      assertProductionSocialImage({
        strict: true,
        imagePath: "/og-image.webp",
      }),
    ).toThrow();

    expect(() =>
      assertProductionSocialImage({
        strict: true,
        imagePath: "https://cdn.example.com/og.png",
      }),
    ).toThrow();
  });

  it("does not enforce social image format outside strict mode", () => {
    expect(() =>
      assertProductionSocialImage({
        strict: false,
        imagePath: "/og-image.svg",
      }),
    ).not.toThrow();
  });
});
