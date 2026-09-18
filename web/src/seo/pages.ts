import { templateSiteConfig } from "../config/site-config";
import { resolveHomepageTool } from "../content/homepage-tool";
import { absoluteUrl, siteConfig } from "./site";
import type { SeoPage } from "./page";

const homePrimaryTool = resolveHomepageTool(siteConfig.homePrimaryToolSlug);

const homeApplicationSchema = homePrimaryTool
  ? {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: homePrimaryTool.name,
      applicationCategory: homePrimaryTool.category,
      operatingSystem: "Web",
      isAccessibleForFree: homePrimaryTool.isFree,
      url: absoluteUrl("/"),
      description: homePrimaryTool.description,
    }
  : {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      description: siteConfig.defaultDescription,
    };

const homeFaqSchema =
  homePrimaryTool && homePrimaryTool.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: homePrimaryTool.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : undefined;

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
      homeApplicationSchema,
      ...(homeFaqSchema ? [homeFaqSchema] : []),
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
