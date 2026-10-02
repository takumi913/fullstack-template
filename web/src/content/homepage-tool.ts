import type { SiteLocale } from "../i18n/locales";
import { toolPages, type ToolPageDefinition } from "./tool-pages";

export function resolveHomepageTool(
  slug: string | null | undefined,
  tools: readonly ToolPageDefinition[] = toolPages,
  locale?: SiteLocale,
) {
  if (!slug) return undefined;

  const tool = tools.find((candidate) => candidate.slug === slug);
  if (!tool) {
    throw new Error(`Configured home.primaryToolSlug "${slug}" does not match any tool definition`);
  }
  if (tool.status === "draft") {
    throw new Error(`Configured home.primaryToolSlug "${slug}" points to a draft tool`);
  }

  if (!locale) return tool;
  const localized = tools.find(
    (candidate) =>
      (candidate.translationKey || candidate.slug) === (tool.translationKey || tool.slug) &&
      (candidate.locale || "en") === locale &&
      candidate.status !== "draft",
  );
  if (!localized) throw new Error(`Homepage tool "${slug}" needs a reviewed ${locale} translation`);
  return localized;
}
