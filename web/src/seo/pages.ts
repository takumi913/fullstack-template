import { siteCopies } from "../config/site-copy";
import { resolveHomepageTool } from "../content/homepage-tool";
import { legalPages } from "../content/legal-pages";
import { localizedPath, supportedLocales, type SiteLocale } from "../i18n/locales";
import { createContentHreflangAlternates, createHreflangAlternates } from "./localization";
import { absoluteUrl, siteConfig } from "./site";
import type { SeoPage } from "./page";

export const publicPagePaths = {
  home: "/",
  tools: "/tools",
  resources: "/resources",
  pricing: "/pricing",
  privacy: "/legal/privacy-policy",
  terms: "/legal/terms",
} as const;
export type PublicPageKind = keyof typeof publicPagePaths;

export function getPublicSeoPages(locale: SiteLocale): Record<PublicPageKind, SeoPage> {
  const copy = siteCopies[locale];
  const homeTool = resolveHomepageTool(siteConfig.homePrimaryToolSlug, undefined, locale);
  const title =
    locale === "en" ? siteConfig.defaultTitle : `${copy.home.title} | ${siteConfig.name}`;
  const description = locale === "en" ? siteConfig.defaultDescription : copy.home.description;
  return Object.fromEntries(
    Object.entries(publicPagePaths).map(([key, basePath]) => {
      const kind = key as PublicPageKind;
      const path = localizedPath(basePath, locale);
      const alternates = createHreflangAlternates(
        supportedLocales.map((language) => ({
          locale: language,
          path: localizedPath(basePath, language),
        })),
        basePath,
      );
      const common = { path, locale, alternates, updatedAt: "2026-10-02" };
      if (kind === "home") {
        return [
          kind,
          {
            ...common,
            title,
            description,
            h1: title,
            intent: "commercial",
            primaryKeyword: locale === "en" ? siteConfig.primaryKeyword : copy.home.primaryKeyword,
            relatedPages: Object.values(publicPagePaths)
              .filter((value) => value !== "/")
              .map((value) => localizedPath(value, locale)),
            schema: [
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteConfig.name,
                url: absoluteUrl(path),
                inLanguage: locale,
              },
              {
                "@context": "https://schema.org",
                "@type": homeTool ? "WebApplication" : "SoftwareApplication",
                name: homeTool?.name || siteConfig.name,
                description: homeTool?.description || description,
                url: absoluteUrl(path),
                inLanguage: locale,
                applicationCategory: homeTool?.category || "DeveloperApplication",
                operatingSystem: "Web",
                ...(homeTool ? { isAccessibleForFree: homeTool.isFree } : {}),
              },
              ...(homeTool?.faq.length
                ? [
                    {
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      inLanguage: locale,
                      mainEntity: homeTool.faq.map((item) => ({
                        "@type": "Question",
                        name: item.question,
                        acceptedAnswer: { "@type": "Answer", text: item.answer },
                      })),
                    },
                  ]
                : []),
            ],
          },
        ];
      }
      const legal = kind === "privacy" || kind === "terms";
      const content = legal ? legalPages[locale][kind] : copy.hubs[kind];
      return [
        kind,
        {
          ...common,
          alternates: legal
            ? createContentHreflangAlternates(
                {
                  status:
                    legalPages[locale][kind as "privacy" | "terms"].status === "draft"
                      ? "example"
                      : "published",
                },
                supportedLocales.map((language) => ({
                  status:
                    legalPages[language][kind as "privacy" | "terms"].status === "draft"
                      ? "example"
                      : "published",
                  locale: language,
                  path: localizedPath(basePath, language),
                })),
              )
            : alternates,
          primaryKeyword: content.primaryKeyword,
          title: `${content.title} | ${siteConfig.name}`,
          description: content.description,
          h1: content.title,
          intent: legal ? "legal" : kind === "resources" ? "informational" : "commercial",
          noindex: legal
            ? legalPages[locale][kind as "privacy" | "terms"].status !== "published"
            : true,
          updatedAt: legal
            ? legalPages[locale][kind as "privacy" | "terms"].updatedAt
            : common.updatedAt,
          schema: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: content.title,
            description: content.description,
            url: absoluteUrl(path),
            inLanguage: locale,
          },
        },
      ];
    }),
  ) as Record<PublicPageKind, SeoPage>;
}
export const publicSeoPages = getPublicSeoPages("en");
export const allPublicSeoPages = supportedLocales.flatMap((locale) =>
  Object.values(getPublicSeoPages(locale)),
);
export const publicPrerenderPaths = allPublicSeoPages.map((page) => page.path);
export const indexableSeoPages = allPublicSeoPages.filter((page) => !page.noindex);
export function getPublicPageByPath(pathname: string) {
  return allPublicSeoPages.find((page) => page.path === pathname);
}
