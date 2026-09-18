import type { SeoAlternate } from "../seo/localization";

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
  path?: string;
  locale?: string;
  alternates?: SeoAlternate[];
  showInDirectory?: boolean;
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

const jsonFormatterAlternates: SeoAlternate[] = [
  { hreflang: "en", path: "/tools/json-formatter" },
  { hreflang: "ja", path: "/ja/tools/json-formatter" },
  { hreflang: "x-default", path: "/tools/json-formatter" },
];

export const toolPages: ToolPageDefinition[] = [
  {
    slug: "json-formatter",
    componentKey: "json-formatter",
    status: "example",
    locale: "en",
    alternates: jsonFormatterAlternates,
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
    slug: "json-formatter-ja",
    componentKey: "json-formatter",
    status: "example",
    path: "/ja/tools/json-formatter",
    locale: "ja",
    alternates: jsonFormatterAlternates,
    showInDirectory: false,
    name: "JSON Formatter",
    category: "開発ツール",
    primaryKeyword: "json 整形",
    title: "JSON 整形ツール - オンラインで JSON を整形・検証",
    description: "ブラウザ上で JSON を整形、検証、圧縮できる日本語版のサンプルページです。",
    h1: "JSON 整形ツール",
    intro:
      "JSON を貼り付けるだけで、読みやすい形式への整形、構文検証、圧縮をブラウザ内で実行できます。",
    features: [
      "JSON を読みやすくインデントして整形",
      "不正な JSON の構文エラーを表示",
      "JSON をコンパクトに圧縮",
      "処理はブラウザ内で完結",
    ],
    howToSteps: [
      "入力欄に JSON を貼り付けます。",
      "Format で整形、Minify で圧縮します。",
      "生成された JSON をコピーして利用します。",
    ],
    faq: [
      {
        question: "入力した JSON はサーバーに送信されますか？",
        answer: "いいえ。このサンプルでは JSON の処理はブラウザ内だけで実行されます。",
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

export function toolPath(tool: ToolPageDefinition | string) {
  if (typeof tool === "string") {
    const definition = toolPages.find((candidate) => candidate.slug === tool);
    return definition?.path || `/tools/${tool}`;
  }
  return tool.path || `/tools/${tool.slug}`;
}

export const routableToolPages = toolPages.filter((tool) => tool.status !== "draft");

export const directoryToolPages = routableToolPages.filter(
  (tool) => tool.showInDirectory !== false,
);

export const toolPrerenderPaths = routableToolPages.map((tool) => toolPath(tool));

export function getToolPageBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return routableToolPages.find((tool) => tool.slug === slug);
}

export function getToolPageByPath(pathname: string | undefined) {
  if (!pathname) return undefined;
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return routableToolPages.find((tool) => toolPath(tool) === normalized);
}

export function getRelatedToolPages(tool: ToolPageDefinition) {
  const related = new Set(tool.relatedSlugs);
  return routableToolPages.filter((candidate) => related.has(candidate.slug));
}
