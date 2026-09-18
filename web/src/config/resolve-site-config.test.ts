import { describe, expect, it } from "vitest";
import { templateSiteConfig } from "./site-config";
import { resolveSiteConfig } from "./resolve-site-config";

describe("resolveSiteConfig", () => {
  it("uses editable site-config values when build overrides are absent", () => {
    const resolved = resolveSiteConfig({});

    expect(resolved.name).toBe(templateSiteConfig.brand.name);
    expect(resolved.defaultTitle).toBe(templateSiteConfig.seo.defaultTitle);
    expect(resolved.defaultDescription).toBe(templateSiteConfig.seo.defaultDescription);
  });

  it("uses non-empty build overrides when provided", () => {
    const resolved = resolveSiteConfig({
      VITE_SITE_NAME: "Acme Tools",
      VITE_SITE_TITLE: "Acme Tools Online",
      VITE_SITE_DESCRIPTION: "Useful browser tools for real workflows.",
    });

    expect(resolved.name).toBe("Acme Tools");
    expect(resolved.defaultTitle).toBe("Acme Tools Online");
    expect(resolved.defaultDescription).toBe("Useful browser tools for real workflows.");
  });

  it("ignores blank build overrides instead of erasing site-config values", () => {
    const resolved = resolveSiteConfig({
      VITE_SITE_NAME: "   ",
      VITE_SITE_TITLE: "",
    });

    expect(resolved.name).toBe(templateSiteConfig.brand.name);
    expect(resolved.defaultTitle).toBe(templateSiteConfig.seo.defaultTitle);
  });
});
