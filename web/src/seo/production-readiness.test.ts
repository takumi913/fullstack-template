import { describe, expect, it } from "vitest";
import type { LandingPageDefinition } from "../content/landing-pages";
import type { ToolPageDefinition } from "../content/tool-pages";
import { scaffoldSentinels } from "../config/scaffold-sentinels";
import { assertProductionContentReady } from "./production-readiness";

const baseTool: ToolPageDefinition = {
  slug: "example-tool",
  componentKey: "example-tool",
  status: "example",
  name: "Example Tool",
  category: "Utility",
  primaryKeyword: "example tool",
  title: "Example Tool",
  description: "A sufficiently descriptive example tool used for production readiness tests.",
  h1: "Example Tool",
  intro: "Use this tool for a real task.",
  features: ["Feature"],
  howToSteps: ["Use it."],
  faq: [],
  relatedSlugs: [],
  updatedAt: "2026-09-18",
};

const baseLanding: LandingPageDefinition = {
  slug: "example-guide",
  kind: "guide",
  status: "draft",
  path: "/guides/example-guide",
  primaryKeyword: "example guide",
  title: "Example Guide",
  description: "A sufficiently descriptive example guide used for production readiness tests.",
  h1: "Example Guide",
  intro: "Read this guide for a real task.",
  sections: [{ heading: "Section", body: "Body" }],
  faq: [],
  relatedToolSlugs: [],
  updatedAt: "2026-09-18",
};

describe("production SEO readiness", () => {
  it("does not enforce production content rules outside strict mode", () => {
    expect(() =>
      assertProductionContentReady({
        strict: false,
        tools: [baseTool],
        landings: [baseLanding],
      }),
    ).not.toThrow();
  });

  it("rejects template example content in strict mode", () => {
    expect(() =>
      assertProductionContentReady({
        strict: true,
        tools: [baseTool],
        landings: [baseLanding],
      }),
    ).toThrow(/template example content/);
  });

  it("rejects a scaffold example even if its status is accidentally changed to published", () => {
    expect(() =>
      assertProductionContentReady({
        strict: true,
        tools: [{ ...baseTool, status: "published", templateExample: true }],
        landings: [],
      }),
    ).toThrow(/template example content/);
  });

  it("allows examples only when explicitly enabled for template testing", () => {
    expect(() =>
      assertProductionContentReady({
        strict: true,
        allowTemplateExamples: true,
        tools: [baseTool],
        landings: [baseLanding],
      }),
    ).not.toThrow();
  });

  it("rejects published content that still contains the original scaffold brand", () => {
    const publishedLanding: LandingPageDefinition = {
      ...baseLanding,
      status: "published",
      title: `Real Guide | ${scaffoldSentinels.name}`,
    };

    expect(() =>
      assertProductionContentReady({
        strict: true,
        allowTemplateExamples: true,
        tools: [],
        landings: [publishedLanding],
      }),
    ).toThrow(/scaffold brand/);
  });

  it("accepts clean published content", () => {
    expect(() =>
      assertProductionContentReady({
        strict: true,
        tools: [{ ...baseTool, status: "published" }],
        landings: [{ ...baseLanding, status: "published" }],
      }),
    ).not.toThrow();
  });
});
