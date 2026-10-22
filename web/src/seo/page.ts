import { createComponent, type Component } from "solid-js";
import { useHead, type HeadTag } from "@solidjs/web";
import { useLocation } from "@solidjs/router";
import { toOpenGraphLocale, type SeoAlternate } from "./localization";
import { absoluteUrl, siteConfig } from "./site";

export type MetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { tagName: "link"; rel: string; href: string; hrefLang?: string }
  | { "script:ld+json": Record<string, unknown> | Array<Record<string, unknown>> };

function headTag(meta: MetaDescriptor): HeadTag {
  if ("title" in meta) return { tag: "title", props: { children: meta.title } };
  if ("script:ld+json" in meta)
    return {
      tag: "script",
      key: "page-schema",
      props: {
        type: "application/ld+json",
        children: JSON.stringify(meta["script:ld+json"]).replace(/</g, "\\u003c"),
      },
    };
  if ("tagName" in meta) {
    const { tagName, hrefLang, ...props } = meta;
    return { tag: tagName, props: { ...props, ...(hrefLang ? { hreflang: hrefLang } : {}) } };
  }
  return { tag: "meta", props: meta };
}

export function withPageMeta<P extends object>(
  Page: Component<P>,
  meta: (pathname: string) => MetaDescriptor[],
): Component<P> {
  // Hydration preloads the route's default export, including its head registration.
  return (props) => {
    const location = useLocation();
    useHead(() => meta(location.pathname).map(headTag));
    return createComponent(Page, props);
  };
}

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
  const robots = [page.noindex ? "noindex" : "index", page.nofollow ? "nofollow" : "follow"].join(
    ", ",
  );
  const locale = page.locale || siteConfig.locale;

  const meta: MetaDescriptor[] = [
    { title: page.title },
    { name: "description", content: page.description },
    { name: "robots", content: robots },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: toOpenGraphLocale(locale) },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: page.title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: page.title },
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
        content: toOpenGraphLocale(alternate.hreflang),
      });
    }
  }

  if (page.schema) {
    meta.push({ "script:ld+json": page.schema });
  }

  return meta;
}

export const privatePageMeta: MetaDescriptor[] = [{ name: "robots", content: "noindex, nofollow" }];

export function privatePageTitleMeta(title: string): MetaDescriptor[] {
  return [{ title: `${title} | ${siteConfig.name}` }, ...privatePageMeta];
}

export function notFoundPageMeta(label = "Page not found"): MetaDescriptor[] {
  return privatePageTitleMeta(label);
}
