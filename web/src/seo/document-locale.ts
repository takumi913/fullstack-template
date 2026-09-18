import { getToolPageBySlug } from "../content/tool-pages";
import { publicSeoPages } from "./pages";
import { siteConfig } from "./site";

export function resolveDocumentLocale(pathname: string) {
  const toolMatch = pathname.match(/^\/tools\/([^/]+)\/?$/);
  if (toolMatch) {
    const tool = getToolPageBySlug(toolMatch[1]);
    if (tool?.locale) return tool.locale;
  }

  const page = Object.values(publicSeoPages).find((candidate) => candidate.path === pathname);
  if (page && "locale" in page && page.locale) {
    return page.locale;
  }

  return siteConfig.locale;
}
