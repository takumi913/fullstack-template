import type { LandingPageDefinition } from "../content/landing-pages";
import { toolPath } from "../content/tool-pages";
import { absoluteUrl } from "./site";
import type { SeoPage } from "./page";

export function createLandingSeoPage(page: LandingPageDefinition): SeoPage {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.h1,
        item: absoluteUrl(page.path),
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.h1,
    url: absoluteUrl(page.path),
    description: page.description,
  };

  const faqSchema =
    page.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
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
    noindex: page.noindex || page.status !== "published",
    relatedPages: page.relatedToolSlugs.map((slug) => toolPath(slug)),
    schema: [webPageSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])],
  };
}
