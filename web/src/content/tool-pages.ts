export type ToolPageStatus = "draft" | "example" | "published";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolPageDefinition {
  slug: string;
  componentKey: string;
  status: ToolPageStatus;
  name: string;
  category: string;
  primaryKeyword: string;
  locale?: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  features: string[];
  howToSteps: string[];
  faq: ToolFaqItem[];
  relatedSlugs: string[];
  runtime?: Record<string, string | number | boolean>;
  updatedAt: string;
  noindex?: boolean;
  isFree?: boolean;
}

export const toolPages: ToolPageDefinition[] = [
  {
    slug: "json-formatter",
    componentKey: "json-formatter",
    status: "example",
    locale: "en",
    name: "JSON Formatter",
    category: "Developer Tool",
    primaryKeyword: "json formatter",
    title: "JSON Formatter - Format and Validate JSON Online",
    description:
      "Format, validate, and minify JSON directly in your browser. This example page demonstrates the reusable tool-page SEO architecture.",
    h1: "JSON Formatter",
    intro:
      "Paste JSON to format, validate, or minify it locally in your browser. Replace this example with your own tool implementation when creating a new site.",
    features: [
      "Format JSON with readable indentation",
      "Validate malformed JSON with a clear error",
      "Minify JSON for compact output",
      "Runs entirely in the browser",
    ],
    howToSteps: [
      "Paste JSON into the input area.",
      "Choose Format to pretty-print it or Minify to compress it.",
      "Copy the generated JSON for use in your project.",
    ],
    faq: [
      {
        question: "Does the JSON leave my browser?",
        answer: "No. This example processes the JSON in the browser and does not upload it.",
      },
      {
        question: "Can it detect invalid JSON?",
        answer: "Yes. Parsing errors are shown before any formatted output is produced.",
      },
    ],
    relatedSlugs: ["word-counter"],
    updatedAt: "2026-09-18",
    noindex: true,
    isFree: true,
  },
  {
    slug: "word-counter",
    componentKey: "word-counter",
    status: "example",
    locale: "en",
    name: "Word Counter",
    category: "Text Tool",
    primaryKeyword: "word counter",
    title: "Word Counter - Count Words and Characters Online",
    description:
      "Count words, characters, lines, and paragraphs instantly. This example demonstrates related-tool internal linking and reusable SSG pages.",
    h1: "Word Counter",
    intro:
      "Enter text to calculate common writing statistics instantly. This is a working example tool included to demonstrate the mother-template architecture.",
    features: [
      "Count words and characters instantly",
      "Track lines and paragraphs",
      "No upload or account required",
      "Useful as a reference implementation for text tools",
    ],
    howToSteps: [
      "Type or paste text into the input area.",
      "Read the automatically updated statistics.",
      "Edit the text and watch the counts update immediately.",
    ],
    faq: [
      {
        question: "How are words counted?",
        answer: "Whitespace-separated non-empty text segments are counted as words.",
      },
      {
        question: "Is my text stored?",
        answer: "No. The example performs counting locally in the browser.",
      },
    ],
    relatedSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
    isFree: true,
  },
];

export function toolPath(slug: string) {
  return `/tools/${slug}`;
}

export const routableToolPages = toolPages.filter((tool) => tool.status !== "draft");

export const toolPrerenderPaths = routableToolPages.map((tool) => toolPath(tool.slug));

export function getToolPageBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return routableToolPages.find((tool) => tool.slug === slug);
}

export function getRelatedToolPages(tool: ToolPageDefinition) {
  const related = new Set(tool.relatedSlugs);
  return routableToolPages.filter((candidate) => related.has(candidate.slug));
}
