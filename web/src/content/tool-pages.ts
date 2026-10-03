import { createContentHreflangAlternates, type SeoAlternate } from "../seo/localization";
import { localizedPath, normalizeLocale, supportedLocales, type SiteLocale } from "../i18n/locales";
import { catalogLanguage, toolsmithCatalog } from "./toolsmith-catalog";
import { toolsmithCopy } from "../config/toolsmith-copy";

export type ToolPageStatus = "draft" | "example" | "published";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolPageDefinition {
  slug: string;
  componentKey: string;
  translationKey?: string;
  status: ToolPageStatus;
  templateExample?: boolean;
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

const designDefinitions: ToolPageDefinition[] = supportedLocales.flatMap((locale) => {
  const language = catalogLanguage(locale);
  const copy = toolsmithCopy(locale);
  return toolsmithCatalog.map((tool) => ({
    slug: locale === "en" ? tool.id : `${tool.id}-zh-cn`,
    componentKey: "ai-text",
    translationKey: tool.id,
    status: "example",
    templateExample: true,
    locale,
    path: localizedPath(`/tools/${tool.id}`, locale),
    name: tool[language][0],
    category: tool.cat,
    primaryKeyword: tool[language][0],
    title: `${tool[language][0]} | Toolsmith`,
    description: tool[language][1],
    h1: tool[language][0],
    intro: tool[language][1],
    features: copy.trust,
    howToSteps: copy.how.map((step) => step.d),
    faq: copy.faq.map(([question, answer]) => ({ question, answer })),
    relatedSlugs: toolsmithCatalog
      .filter((item) => item.id !== tool.id && (item.cat === tool.cat || item.hot))
      .slice(0, 4)
      .map((item) => (locale === "en" ? item.id : `${item.id}-zh-cn`)),
    runtime: { toolId: tool.id, preview: true },
    updatedAt: "2026-10-03",
    noindex: true,
    isFree: true,
  }));
});

const definitions: ToolPageDefinition[] = [
  ...designDefinitions,
  {
    slug: "json-formatter",
    componentKey: "json-formatter",
    status: "example",
    templateExample: true,
    locale: "en",
    translationKey: "json-formatter",
    name: "JSON Formatter",
    category: "Developer Tool",
    primaryKeyword: "json formatter",
    title: "JSON Formatter - Format and Validate JSON Online",
    description:
      "Format, validate and minify JSON directly in your browser. Read API responses clearly and find syntax errors without uploading your data.",
    h1: "JSON Formatter",
    intro:
      "Paste an API response or configuration file. Add readable indentation, check syntax or get compact JSON — all in your browser.",
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
        answer: "No. JSON is parsed and formatted entirely in your browser. Nothing is uploaded.",
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
    slug: "json-formatter-zh-cn",
    componentKey: "json-formatter",
    status: "example",
    templateExample: true,
    path: "/zh-cn/tools/json-formatter",
    locale: "zh-CN",
    translationKey: "json-formatter",

    name: "JSON 格式化工具",
    category: "开发工具",
    primaryKeyword: "JSON 格式化",
    title: "JSON 格式化工具 - 在线格式化、校验与压缩 JSON",
    description:
      "在浏览器内格式化、校验和压缩 JSON，快速阅读 API 响应或定位语法错误，数据不会上传到服务器。",
    h1: "JSON 格式化工具",
    intro:
      "粘贴接口响应或配置文件，立即获得清晰的缩进格式。也可以压缩 JSON，或在修改前检查语法错误。",
    features: [
      "将 JSON 格式化为清晰的缩进结构",
      "在格式化前显示 JSON 语法错误",
      "压缩 JSON，减少文本体积",
      "输入与输出均在浏览器内处理",
    ],
    howToSteps: [
      "将 JSON 粘贴到输入框。",
      "选择格式化以便阅读，或选择压缩获得紧凑输出。",
      "复制输出，继续调试接口或编辑配置。",
    ],
    faq: [
      { question: "输入的 JSON 会上传吗？", answer: "不会。JSON 解析与格式化均在浏览器内执行。" },
      {
        question: "能检查无效的 JSON 吗？",
        answer: "可以。工具会先解析输入，语法错误会显示在结果区域。",
      },
    ],
    relatedSlugs: ["word-counter-zh-cn"],
    updatedAt: "2026-09-18",
    noindex: true,
    isFree: true,
  },
  {
    slug: "word-counter",
    translationKey: "word-counter",
    componentKey: "word-counter",
    status: "example",
    templateExample: true,
    locale: "en",
    name: "Word Counter",
    category: "Text Tool",
    primaryKeyword: "word counter",
    title: "Word Counter - Count Words and Characters Online",
    description:
      "Count words, characters, lines and paragraphs as you type. Check the length of an article or email without uploading your text.",
    h1: "Word Counter",
    intro:
      "Paste a draft, article or email to see word and character counts instantly. Words are counted as whitespace-separated text segments.",
    features: [
      "Count words and characters instantly",
      "Track lines and paragraphs",
      "No upload or account required",
      "Counts update immediately as you edit",
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
        answer: "No. Counting happens locally in your browser.",
      },
    ],
    relatedSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
    isFree: true,
  },
  {
    slug: "word-counter-zh-cn",
    translationKey: "word-counter",
    componentKey: "word-counter",
    path: "/zh-cn/tools/word-counter",
    locale: "zh-CN",
    status: "example",
    templateExample: true,
    name: "英文词数统计工具",
    category: "文本工具",
    primaryKeyword: "英文词数统计",
    title: "英文词数统计工具 - 在线统计词数、字符、行与段落",
    description:
      "在浏览器内统计英文词数、字符数、行数与段落数。适合检查英文文章长度，输入不会上传或保存。",
    h1: "英文词数统计工具",
    intro:
      "写英文文章、摘要或邮件时，粘贴文本即可实时查看词数和字符数。词数按空白分隔，不用于统计中文分词。",
    features: [
      "实时统计按空白分隔的英文词数",
      "查看字符数、行数与段落数",
      "无需登录，也不上传文本",
      "编辑文本后立即更新统计结果",
    ],
    howToSteps: [
      "输入或粘贴英文文本。",
      "查看词数、字符数、行数与段落数。",
      "继续编辑，统计值会自动更新。",
    ],
    faq: [
      {
        question: "词数如何计算？",
        answer: "非空文本按空白字符分隔，每个片段计为一个词。它不进行中文分词。",
      },
      { question: "文本会被保存吗？", answer: "不会。统计在浏览器内完成。" },
    ],
    relatedSlugs: ["json-formatter-zh-cn"],
    updatedAt: "2026-10-02",
    noindex: true,
    isFree: true,
  },
];

export const toolPages: ToolPageDefinition[] = definitions.map((tool) => ({
  ...tool,
  showInDirectory: tool.componentKey === "ai-text",
  alternates: tool.translationKey
    ? createContentHreflangAlternates(
        tool,
        definitions
          .filter((candidate) => candidate.translationKey === tool.translationKey)
          .map((candidate) => ({
            ...candidate,
            locale: candidate.locale || "en",
            path: candidate.path || `/tools/${candidate.slug}`,
          })),
      )
    : tool.alternates,
}));

export function getDirectoryToolPages(locale: SiteLocale) {
  return directoryToolPages.filter((tool) => normalizeLocale(tool.locale) === locale);
}

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
