import type { MetaDescriptor } from "react-router";
import type { SeoAlternate } from "./localization";
import { absoluteUrl, siteConfig } from "./site";

export type SeoIntent = "tool" | "informational" | "comparison" | "commercial" | "legal";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export interface SeoPage {
  path: string;
  primaryKeyword: string;
  title: string;
  description: string;
  h1: string;
  intent: SeoIntent;
  locale?: string;
  alternates?: SeoAlternate[];
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
  updatedAt?: string;
  relatedPages?: string[];
  schema?: JsonLd;
}

export function createSeoMeta(page: SeoPage): MetaDescriptor[] {
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image || siteConfig.defaultImage);
  const robots = [
    page.noindex ? "noindex" : "index",
    page.nofollow ? "nofollow" : "follow",
  ].join(", ");
  const locale = page.locale || siteConfig.locale;

  const meta: MetaDescriptor[] = [
    { title: page.title },
    { name: "description", content: page.description },
    { name: "robots", content: robots },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: locale },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
  ];

  for (const alternate of page.alternates || []) {
    meta.push({
      tagName: "link",
      rel: "alternate",
      hrefLang: alternate.hreflang,
      href: absoluteUrl(alternate.path),
    });

    if (alternate.hreflang !== "x-default" && alternate.hreflang !== locale) {
      meta.push({
        property: "og:locale:alternate",
        content: alternate.hreflang,
      });
    }
  }

  if (page.schema) {
    meta.push({ "script:ld+json": page.schema });
  }

  return meta;
}

export const privatePageMeta: MetaDescriptor[] = [{ name: "robots", content: "noindex, nofollow" }];
