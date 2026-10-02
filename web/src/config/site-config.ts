import { scaffoldSentinels } from "./scaffold-sentinels";

export const templateSiteConfig = {
  brand: {
    name: scaffoldSentinels.name,
    shortName: "Fullstack",
    mark: "F",
    favicon: "/favicon.svg",
  },
  seo: {
    locale: "en",
    primaryKeyword: "go react saas template",
    defaultTitle: scaffoldSentinels.title,
    defaultDescription: scaffoldSentinels.description,
    defaultImage: "/og-image.svg",
  },
  appearance: {
    themeColor: "#ffffff",
    backgroundColor: "#ffffff",
    iconBackground: "#18181b",
    iconForeground: "#ffffff",
  },
  navigation: { showAuthLinks: true as boolean },
  home: { primaryToolSlug: null as string | null },
} as const;
