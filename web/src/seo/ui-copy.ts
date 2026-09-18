const englishCopy = {
  home: "Home",
  tools: "Tools",
  resources: "Resources",
  language: "Language",
  whatThisToolDoes: "What this tool does",
  howToUse: "How to use it",
  faq: "Frequently asked questions",
  relatedTools: "Related tools",
  relatedResources: "Related resources",
  kinds: {
    "use-case": "Use case",
    comparison: "Comparison",
    guide: "Guide",
  },
} as const;

const japaneseCopy = {
  home: "ホーム",
  tools: "ツール",
  resources: "リソース",
  language: "言語",
  whatThisToolDoes: "このツールでできること",
  howToUse: "使い方",
  faq: "よくある質問",
  relatedTools: "関連ツール",
  relatedResources: "関連リソース",
  kinds: {
    "use-case": "活用例",
    comparison: "比較",
    guide: "ガイド",
  },
} as const;

const chineseCopy = {
  home: "首页",
  tools: "工具",
  resources: "资源",
  language: "语言",
  whatThisToolDoes: "这个工具可以做什么",
  howToUse: "使用方法",
  faq: "常见问题",
  relatedTools: "相关工具",
  relatedResources: "相关资源",
  kinds: {
    "use-case": "使用场景",
    comparison: "对比",
    guide: "指南",
  },
} as const;

export function publicPageCopy(locale: string | undefined) {
  const normalized = locale?.trim().toLocaleLowerCase() || "";

  if (normalized === "ja" || normalized.startsWith("ja-")) return japaneseCopy;
  if (normalized === "zh" || normalized.startsWith("zh-")) return chineseCopy;

  return englishCopy;
}
