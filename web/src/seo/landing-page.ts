import { isIndexableContent } from "./localization";
import { localizedPath, normalizeLocale } from "../i18n/locales";
import { publicPageCopy } from "./ui-copy";
import type { LandingPageDefinition } from "../content/landing-pages";
import { toolPath } from "../content/tool-pages";
import { absoluteUrl } from "./site";
import type { SeoPage } from "./page";

export function createLandingSeoPage(page: LandingPageDefinition): SeoPage {
  const locale = normalizeLocale(page.locale);
  const copy = publicPageCopy(locale);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.home,
        item: absoluteUrl(localizedPath("/", locale)),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.resources,
        item: absoluteUrl(localizedPath("/resources", locale)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.h1,
        item: absoluteUrl(page.path),
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: locale,
    name: page.h1,
    url: absoluteUrl(page.path),
    description: page.description,
  };

  const faqSchema =
    page.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: locale,
          mainEntity: page.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : undefined;

  return {
    path: page.path,
    primaryKeyword: page.primaryKeyword,
    title: page.title,
    description: page.description,
    h1: page.h1,
    intent: page.kind === "comparison" ? "comparison" : "informational",
    locale: page.locale,
    alternates: page.alternates,
    updatedAt: page.updatedAt,
    noindex: !isIndexableContent(page),
    relatedPages: page.relatedToolSlugs.map((slug) => toolPath(slug)),
    schema: [webPageSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])],
  };
}
