import { getToolPageByPath } from "../content/tool-pages";
import { publicSeoPages } from "./pages";
import { siteConfig } from "./site";

export function resolveDocumentLocale(pathname: string) {
  const tool = getToolPageByPath(pathname);
  if (tool?.locale) return tool.locale;

  const page = Object.values(publicSeoPages).find((candidate) => candidate.path === pathname);
  if (page && "locale" in page && page.locale) {
    return page.locale;
  }

  return siteConfig.locale;
}
