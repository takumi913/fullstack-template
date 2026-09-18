import type { SeoAlternate } from "../seo/localization";

export type LandingPageStatus = "draft" | "example" | "published";
export type LandingPageKind = "use-case" | "comparison" | "guide";

export interface LandingSection {
  heading: string;
  body: string;
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingPageDefinition {
  slug: string;
  kind: LandingPageKind;
  status: LandingPageStatus;
  path: string;
  primaryKeyword: string;
  locale?: string;
  alternates?: SeoAlternate[];
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: LandingSection[];
  faq: LandingFaqItem[];
  relatedToolSlugs: string[];
  updatedAt: string;
  noindex?: boolean;
}

export const landingPages: LandingPageDefinition[] = [
  {
    slug: "json-api-debugging",
    kind: "use-case",
    status: "example",
    path: "/use-cases/json-api-debugging",
    locale: "en",
    primaryKeyword: "json api debugging",
    title: "JSON API Debugging Workflow | Fullstack Template",
    description:
      "A reusable example landing page showing how a JSON formatter can support API debugging workflows.",
    h1: "Debug JSON APIs Faster",
    intro:
      "This noindex example demonstrates how a use-case landing page can explain a real workflow and link directly to the relevant tool.",
    sections: [
      {
        heading: "Inspect the response payload",
        body: "Start by formatting the raw response so nested objects, arrays, and unexpected values are easy to scan.",
      },
      {
        heading: "Validate before debugging application code",
        body: "Confirm the payload is valid JSON first. A malformed response can look like an application bug even when the failure is in the upstream API.",
      },
    ],
    faq: [
      {
        question: "Should a use-case page duplicate the tool page?",
        answer:
          "No. The use-case page should answer a different search intent and explain a workflow, while the tool page should focus on completing the task immediately.",
      },
    ],
    relatedToolSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
  },
  {
    slug: "json-formatter-vs-validator",
    kind: "comparison",
    status: "example",
    path: "/compare/json-formatter-vs-validator",
    locale: "en",
    primaryKeyword: "json formatter vs json validator",
    title: "JSON Formatter vs JSON Validator | Fullstack Template",
    description:
      "A noindex comparison-page example for separating formatting intent from validation intent.",
    h1: "JSON Formatter vs JSON Validator",
    intro:
      "This example shows how comparison pages can target a distinct decision-oriented query without creating another thin copy of the tool page.",
    sections: [
      {
        heading: "Use a formatter for readability",
        body: "A formatter changes presentation by adding indentation and line breaks so structured data is easier for humans to inspect.",
      },
      {
        heading: "Use a validator for correctness",
        body: "A validator checks whether the input conforms to JSON syntax and should explain parsing errors when it does not.",
      },
    ],
    faq: [],
    relatedToolSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
  },
];

export const routableLandingPages = landingPages.filter((page) => page.status !== "draft");

export const landingPrerenderPaths = routableLandingPages.map((page) => page.path);

export function getLandingPageByPath(pathname: string | undefined) {
  if (!pathname) return undefined;
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return routableLandingPages.find((page) => page.path === normalized);
}
