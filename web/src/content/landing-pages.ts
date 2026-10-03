import { createContentHreflangAlternates, type SeoAlternate } from "../seo/localization";
import { localizedPath, normalizeLocale, supportedLocales, type SiteLocale } from "../i18n/locales";
import { toolsmithCopy } from "../config/toolsmith-copy";

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
  translationKey?: string;
  kind: LandingPageKind;
  status: LandingPageStatus;
  templateExample?: boolean;
  path: string;
  primaryKeyword: string;
  locale?: string;
  alternates?: SeoAlternate[];
  showInDirectory?: boolean;
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

const definitions: LandingPageDefinition[] = [
  ...supportedLocales.map((locale): LandingPageDefinition => {
    const copy = toolsmithCopy(locale);
    return {
      slug: locale === "en" ? "read-paper" : "read-paper-zh-cn",
      translationKey: "read-paper",
      kind: "guide",
      status: "example",
      templateExample: true,
      path: localizedPath("/guides/read-paper", locale),
      locale,
      primaryKeyword: locale === "en" ? "AI paper summary" : "AI 论文摘要",
      title: copy.guideTitle,
      description: copy.posts[0].desc,
      h1: copy.guideTitle,
      intro: copy.guideIntro,
      sections: copy.gSteps.map((step) => ({ heading: step.t, body: step.d })),
      faq: [],
      relatedToolSlugs: [locale === "en" ? "summarizer" : "summarizer-zh-cn"],
      updatedAt: "2026-09-18",
      noindex: true,
    };
  }),
  {
    slug: "json-api-debugging",
    translationKey: "json-api-debugging",
    kind: "use-case",
    status: "example",
    templateExample: true,
    path: "/use-cases/json-api-debugging",
    locale: "en",
    primaryKeyword: "json api debugging",
    title: "JSON API Debugging — A Practical Workflow",
    description:
      "Find malformed responses and unexpected values. A practical workflow for formatting and validating JSON API payloads.",
    h1: "Debug JSON APIs Faster",
    intro:
      "Start with the response itself: format it for readability, confirm the syntax, then follow the data into your application.",
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
        question: "Should I format or validate the response first?",
        answer:
          "Validate first. A formatter needs valid JSON before it can add indentation. The JSON Formatter parses your input and shows syntax errors before producing output.",
      },
    ],
    relatedToolSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
  },
  {
    slug: "json-syntax",
    translationKey: "json-syntax",
    kind: "guide",
    status: "example",
    templateExample: true,
    path: "/guides/json-syntax",
    locale: "en",

    primaryKeyword: "json syntax",
    title: "JSON Syntax Guide — Objects, Arrays and Values",
    description:
      "Understand objects, arrays, quoted keys and value types. Learn the essentials before working with real API responses.",
    h1: "JSON Syntax Guide",
    intro: "Learn the core JSON syntax rules before formatting or validating real API payloads.",
    sections: [
      {
        heading: "Objects use key-value pairs",
        body: "JSON objects are wrapped in curly braces and use double-quoted keys followed by a colon and a value.",
      },
      {
        heading: "Arrays preserve ordered values",
        body: "JSON arrays are wrapped in square brackets and can contain strings, numbers, booleans, null, objects, or other arrays.",
      },
    ],
    faq: [],
    relatedToolSlugs: ["json-formatter"],
    updatedAt: "2026-09-18",
    noindex: true,
  },
  {
    slug: "json-formatter-vs-validator",
    translationKey: "json-formatter-vs-validator",
    kind: "comparison",
    status: "example",
    templateExample: true,
    path: "/compare/json-formatter-vs-validator",
    locale: "en",
    primaryKeyword: "json formatter vs json validator",
    title: "JSON Formatter vs JSON Validator — Which Do You Need?",
    description:
      "Formatting improves readability. Validation checks syntax. Learn when to use each and how they work together.",
    h1: "JSON Formatter vs JSON Validator",
    intro:
      "Trying to read nested data, or tracking down a parsing error? Formatting and validation solve different parts of the same workflow.",
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
  {
    slug: "json-api-debugging-zh-cn",
    translationKey: "json-api-debugging",
    kind: "use-case",
    status: "example",
    templateExample: true,
    path: "/zh-cn/use-cases/json-api-debugging",
    locale: "zh-CN",
    primaryKeyword: "JSON 接口调试",
    title: "JSON 接口调试流程 - 排查 API 响应与语法错误",
    description: "从格式化原始响应到确认语法有效性，用 JSON 工具逐步排查 API 返回数据中的问题。",
    h1: "更高效地调试 JSON 接口",
    intro: "接口返回错误时，先确认响应内容，再判断是 JSON 语法、上游接口还是业务代码出了问题。",
    sections: [
      {
        heading: "先阅读响应结构",
        body: "格式化原始响应，展开嵌套对象和数组，检查缺失字段、异常值以及数据类型。",
      },
      {
        heading: "先校验语法，再排查业务逻辑",
        body: "确认响应是有效的 JSON。不完整或格式错误的上游响应，也可能表现为业务代码报错。",
      },
    ],
    faq: [
      {
        question: "场景页需要复制工具页吗？",
        answer:
          "不需要。场景页说明完成具体任务的流程，工具页让用户立即执行操作，两者服务不同的搜索意图。",
      },
    ],
    relatedToolSlugs: ["json-formatter-zh-cn"],
    updatedAt: "2026-10-02",
    noindex: true,
  },
  {
    slug: "json-syntax-zh-cn",
    translationKey: "json-syntax",
    kind: "guide",
    status: "example",
    templateExample: true,
    path: "/zh-cn/guides/json-syntax",
    locale: "zh-CN",
    primaryKeyword: "JSON 语法",
    title: "JSON 语法指南 - 对象、数组与常见规则",
    description:
      "学习 JSON 对象与数组的写法，理解键值对、双引号和允许的数据类型，再用格式化工具检查真实响应。",
    h1: "JSON 语法指南",
    intro: "在格式化或校验接口数据前，先掌握 JSON 的基本语法。",
    sections: [
      {
        heading: "对象使用键值对",
        body: "JSON 对象用花括号包围。键必须使用双引号，键和值之间用冒号分隔，多个键值对用逗号分隔。",
      },
      {
        heading: "数组保持值的顺序",
        body: "JSON 数组用方括号包围，可包含字符串、数字、布尔值、null、对象和其他数组，不允许尾随逗号。",
      },
    ],
    faq: [],
    relatedToolSlugs: ["json-formatter-zh-cn"],
    updatedAt: "2026-10-02",
    noindex: true,
  },
  {
    slug: "json-formatter-vs-validator-zh-cn",
    translationKey: "json-formatter-vs-validator",
    kind: "comparison",
    status: "example",
    templateExample: true,
    path: "/zh-cn/compare/json-formatter-vs-validator",
    locale: "zh-CN",
    primaryKeyword: "JSON 格式化和校验的区别",
    title: "JSON 格式化和校验有什么区别？",
    description:
      "了解 JSON 格式化与语法校验分别解决什么问题，判断何时需要可读的缩进，何时需要定位语法错误。",
    h1: "JSON 格式化与 JSON 校验",
    intro: "格式化侧重阅读体验，校验侧重语法有效性。选择工具前，先确定你要完成哪种任务。",
    sections: [
      {
        heading: "格式化用于提高可读性",
        body: "格式化通过缩进和换行展示数据，让人更容易阅读嵌套结构，不改变 JSON 表达的内容。",
      },
      {
        heading: "校验用于确认语法有效",
        body: "校验检查输入是否符合 JSON 语法。输入无效时，需要先根据解析错误修正内容，再进行格式化。",
      },
    ],
    faq: [],
    relatedToolSlugs: ["json-formatter-zh-cn"],
    updatedAt: "2026-10-02",
    noindex: true,
  },
];
export const landingPages: LandingPageDefinition[] = definitions.map((page) => ({
  ...page,
  showInDirectory: page.translationKey === "read-paper",
  alternates: page.translationKey
    ? createContentHreflangAlternates(
        page,
        definitions
          .filter((candidate) => candidate.translationKey === page.translationKey)
          .map((candidate) => ({
            ...candidate,
            locale: candidate.locale || "en",
            path: candidate.path,
          })),
      )
    : page.alternates,
}));

export function getDirectoryLandingPages(locale: SiteLocale) {
  return directoryLandingPages.filter((page) => normalizeLocale(page.locale) === locale);
}

export const routableLandingPages = landingPages.filter((page) => page.status !== "draft");

export const directoryLandingPages = routableLandingPages.filter(
  (page) => page.showInDirectory !== false,
);

export const landingPrerenderPaths = routableLandingPages.map((page) => page.path);

export function getLandingPageByPath(pathname: string | undefined) {
  if (!pathname) return undefined;
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return routableLandingPages.find((page) => page.path === normalized);
}

export function getLandingPagesForTool(toolSlug: string) {
  return routableLandingPages.filter((page) => page.relatedToolSlugs.includes(toolSlug));
}
