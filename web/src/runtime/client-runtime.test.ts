import { describe, expect, it } from "vitest";
import { shouldHydrateDocument } from "./client-runtime";

describe("client runtime policy", () => {
  it("always hydrates the generic SPA fallback", () => {
    expect(shouldHydrateDocument("/", 1)).toBe(true);
  });

  it("hydrates interactive tool routes", () => {
    expect(shouldHydrateDocument("/tools/json-formatter", 3)).toBe(true);
    expect(shouldHydrateDocument("/ja/tools/json-formatter", 3)).toBe(true);
  });

  it("hydrates auth and private app routes", () => {
    for (const path of [
      "/login",
      "/register",
      "/dashboard",
      "/settings/profile",
      "/settings/security",
      "/tenant/settings",
      "/tenant/members",
    ]) {
      expect(shouldHydrateDocument(path, 3), path).toBe(true);
    }
  });

  it("keeps static SEO pages free of hydration", () => {
    for (const path of [
      "/",
      "/tools",
      "/resources",
      "/guides/json-syntax",
      "/ja/guides/json-syntax",
      "/use-cases/json-api-debugging",
      "/compare/json-formatter-vs-validator",
      "/legal/privacy-policy",
      "/legal/terms",
      "/404",
    ]) {
      expect(shouldHydrateDocument(path, 3), path).toBe(false);
    }
  });
});
