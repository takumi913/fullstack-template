import { templateSiteConfig } from "../config/site-config";
import { absoluteUrl, siteConfig } from "./site";
import type { SeoPage } from "./page";

export const publicSeoPages = {
  home: {
    path: "/",
    primaryKeyword: siteConfig.primaryKeyword,
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    h1: siteConfig.defaultTitle,
    intent: "commercial",
    updatedAt: "2026-09-18",
    relatedPages: ["/tools", "/resources", "/legal/privacy-policy", "/legal/terms"],
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: absoluteUrl("/"),
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: absoluteUrl("/"),
        description: siteConfig.defaultDescription,
      },
    ],
  },
  tools: {
    path: "/tools",
    primaryKeyword: templateSiteConfig.hubs.tools.primaryKeyword,
    locale: "en",
    title: `${templateSiteConfig.hubs.tools.title} | ${siteConfig.name}`,
    description: templateSiteConfig.hubs.tools.description,
    h1: templateSiteConfig.hubs.tools.title,
    intent: "commercial",
    updatedAt: "2026-09-18",
    noindex: true,
  },
  resources: {
    path: "/resources",
    primaryKeyword: templateSiteConfig.hubs.resources.primaryKeyword,
    locale: "en",
    title: `${templateSiteConfig.hubs.resources.title} | ${siteConfig.name}`,
    description: templateSiteConfig.hubs.resources.description,
    h1: templateSiteConfig.hubs.resources.title,
    intent: "informational",
    updatedAt: "2026-09-18",
    noindex: true,
  },
  privacy: {
    path: "/legal/privacy-policy",
    primaryKeyword: templateSiteConfig.legal.privacy.primaryKeyword,
    title: `${templateSiteConfig.legal.privacy.title} | ${siteConfig.name}`,
    description: `${siteConfig.name} ${templateSiteConfig.legal.privacy.description}`,
    h1: templateSiteConfig.legal.privacy.title,
    intent: "legal",
    updatedAt: "2026-09-18",
    noindex: true,
  },
  terms: {
    path: "/legal/terms",
    primaryKeyword: templateSiteConfig.legal.terms.primaryKeyword,
    title: `${templateSiteConfig.legal.terms.title} | ${siteConfig.name}`,
    description: `${siteConfig.name} ${templateSiteConfig.legal.terms.description}`,
    h1: templateSiteConfig.legal.terms.title,
    intent: "legal",
    updatedAt: "2026-09-18",
    noindex: true,
  },
} satisfies Record<string, SeoPage>;

export const indexableSeoPages = Object.values(publicSeoPages).filter(
  (page) => !("noindex" in page) || !page.noindex,
);
