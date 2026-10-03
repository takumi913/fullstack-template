import type { SiteLocale } from "../i18n/locales";

export type TextMode = "rewrite" | "summarize" | "translate";
export interface CatalogTool {
  id: string;
  mode: TextMode;
  cat: string;
  g: string;
  hot?: number;
  isNew?: number;
  en: string[];
  zh: string[];
}
export const toolsmithCatalog: CatalogTool[] = [
  {
    id: "rewriter",
    mode: "rewrite",
    cat: "write",
    g: "Aa",
    hot: 1,
    zh: ["AI 改写", "换一种说法表达同样的意思，可控制语气与长度"],
    en: ["AI Rewriter", "Say the same thing differently, with tone and length control"],
  },
  {
    id: "summarizer",
    mode: "summarize",
    cat: "understand",
    g: "≡",
    hot: 1,
    zh: ["AI 摘要", "把长文提炼成一句话、要点或一段话"],
    en: ["AI Summarizer", "Condense long text into one line, bullets or a paragraph"],
  },
  {
    id: "translator",
    mode: "translate",
    cat: "lang",
    g: "⇄",
    hot: 1,
    zh: ["AI 翻译", "保留语境与术语的自然翻译，支持 40+ 语言"],
    en: ["AI Translator", "Natural, context-aware translation across 40+ languages"],
  },
  {
    id: "polisher",
    mode: "rewrite",
    cat: "write",
    g: "✓",
    zh: ["语法润色", "修正语法、错别字和读起来别扭的句子"],
    en: ["Grammar Polisher", "Fix grammar, typos and awkward sentences"],
  },
  {
    id: "headline",
    mode: "rewrite",
    cat: "write",
    g: "H1",
    isNew: 1,
    zh: ["标题生成", "为文章、视频和商品生成多个标题备选"],
    en: ["Headline Generator", "Headline options for posts, videos and products"],
  },
  {
    id: "expander",
    mode: "rewrite",
    cat: "write",
    g: "+",
    zh: ["AI 扩写", "把几条要点扩展成完整连贯的段落"],
    en: ["Text Expander", "Turn a few bullet points into flowing paragraphs"],
  },
  {
    id: "tone",
    mode: "rewrite",
    cat: "write",
    g: "~",
    zh: ["语气转换", "在正式、轻松、友好之间一键切换"],
    en: ["Tone Changer", "Switch between formal, casual and friendly"],
  },
  {
    id: "email",
    mode: "rewrite",
    cat: "write",
    g: "@",
    isNew: 1,
    zh: ["邮件助手", "根据几句要点写出得体的工作邮件"],
    en: ["Email Writer", "Draft a polished work email from a few notes"],
  },
  {
    id: "keywords",
    mode: "summarize",
    cat: "understand",
    g: "#",
    zh: ["关键词提取", "从任意文本中提取主题词与标签"],
    en: ["Keyword Extractor", "Pull topics and tags out of any text"],
  },
  {
    id: "detect",
    mode: "translate",
    cat: "lang",
    g: "?",
    zh: ["语言识别", "识别一段文字使用的语言"],
    en: ["Language Detector", "Identify which language a text is in"],
  },
  {
    id: "counter",
    mode: "summarize",
    cat: "text",
    g: "12",
    zh: ["字数统计", "统计字数、词数、句子与阅读时长"],
    en: ["Word Counter", "Count words, characters and reading time"],
  },
  {
    id: "case",
    mode: "rewrite",
    cat: "text",
    g: "aA",
    zh: ["大小写转换", "大写、小写、标题格式一键切换"],
    en: ["Case Converter", "UPPER, lower and Title Case in one click"],
  },
];
export const toolsmithCategories = [
  {
    id: "all",
    zh: "全部",
    en: "All",
  },
  {
    id: "write",
    zh: "AI 写作",
    en: "Writing",
  },
  {
    id: "understand",
    zh: "阅读理解",
    en: "Reading",
  },
  {
    id: "lang",
    zh: "语言",
    en: "Language",
  },
  {
    id: "text",
    zh: "文本实用",
    en: "Utilities",
  },
];
export const toolsmithLanguages = [
  {
    id: "en",
    native: "English",
    code: "EN",
    ready: 1,
  },
  {
    id: "zh",
    native: "简体中文",
    code: "zh-CN",
    ready: 1,
  },
  {
    id: "ja",
    native: "日本語",
    code: "JA",
  },
  {
    id: "ko",
    native: "한국어",
    code: "KO",
  },
  {
    id: "es",
    native: "Español",
    code: "ES",
  },
  {
    id: "de",
    native: "Deutsch",
    code: "DE",
  },
  {
    id: "fr",
    native: "Français",
    code: "FR",
  },
];
export function catalogLanguage(locale: SiteLocale) {
  return locale === "zh-CN" ? "zh" : "en";
}
export function catalogToolPath(id: string, locale: SiteLocale) {
  return `${locale === "zh-CN" ? "/zh-cn" : ""}/tools/${id}`;
}
export function filterCatalog(query: string, category = "all") {
  const search = query.trim().toLowerCase();
  return toolsmithCatalog.filter(
    (tool) =>
      (category === "all" || tool.cat === category) &&
      (!search || [...tool.en, ...tool.zh, tool.id].join(" ").toLowerCase().includes(search)),
  );
}
