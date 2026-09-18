import { describe, expect, it } from "vitest";
import { templateSiteConfig } from "../config/site-config";
import { assertSeoBuildSiteIdentity } from "./site-identity";

const customIdentity = {
  name: "Acme Tools",
  title: "Acme Tools - Useful Online Utilities",
  description: "Fast browser-based utilities for everyday developer and content workflows.",
};

describe("site identity validation", () => {
  it("accepts a customized production identity", () => {
    expect(() => assertSeoBuildSiteIdentity(customIdentity, true)).not.toThrow();
  });

  it("rejects missing identity fields in strict mode", () => {
    expect(() => assertSeoBuildSiteIdentity({}, true)).toThrow();
  });

  it("rejects the default template brand in strict mode", () => {
    expect(() =>
      assertSeoBuildSiteIdentity(
        {
          ...customIdentity,
          name: templateSiteConfig.brand.name,
        },
        true,
      ),
    ).toThrow();
  });

  it("rejects the default template title in strict mode", () => {
    expect(() =>
      assertSeoBuildSiteIdentity(
        {
          ...customIdentity,
          title: templateSiteConfig.seo.defaultTitle,
        },
        true,
      ),
    ).toThrow();
  });

  it("rejects the default template description in strict mode", () => {
    expect(() =>
      assertSeoBuildSiteIdentity(
        {
          ...customIdentity,
          description: templateSiteConfig.seo.defaultDescription,
        },
        true,
      ),
    ).toThrow();
  });

  it("allows defaults outside strict production mode", () => {
    expect(() => assertSeoBuildSiteIdentity({}, false)).not.toThrow();
  });
});
