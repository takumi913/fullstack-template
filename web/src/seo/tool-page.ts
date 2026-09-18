import { toolPath, type ToolPageDefinition } from "@/content/tool-pages";
import { absoluteUrl, siteConfig } from "./site";
import type { SeoPage } from "./page";

export function createToolSeoPage(tool: ToolPageDefinition): SeoPage {
  const path = toolPath(tool.slug);
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
        name: "Tools",
        item: absoluteUrl("/tools"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: absoluteUrl(path),
      },
    ],
  };

  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: absoluteUrl(path),
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "Web",
    isAccessibleForFree: tool.isFree,
  };

  const faqSchema =
    tool.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: tool.faq.map((item) => ({
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
    path,
    primaryKeyword: tool.primaryKeyword,
    title: tool.title,
    description: tool.description,
    h1: tool.h1,
    intent: "tool",
    updatedAt: tool.updatedAt,
    noindex: tool.noindex || tool.status !== "published",
    relatedPages: tool.relatedSlugs.map(toolPath),
    schema: [applicationSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])],
    image: siteConfig.defaultImage,
  };
}
