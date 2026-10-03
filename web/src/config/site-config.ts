export const templateSiteConfig = {
  brand: {
    name: "Toolsmith",
    shortName: "Toolsmith",
    mark: "◆",
    favicon: "/toolsmith.svg",
  },
  seo: {
    locale: "en",
    primaryKeyword: "AI text tools",
    defaultTitle: "Toolsmith — Rewrite, Summarize and Translate Text",
    defaultDescription:
      "A set of small AI tools for people who work with words every day. Rewrite, summarize and translate text in one simple workspace.",
    defaultImage: "/og-image.svg",
  },
  appearance: {
    themeColor: "#0c0d0f",
    backgroundColor: "#0c0d0f",
    iconBackground: "#0c0d0f",
    iconForeground: "#c3ed72",
  },
  navigation: { showAuthLinks: true as boolean },
  home: { primaryToolSlug: "rewriter" as string | null },
} as const;
