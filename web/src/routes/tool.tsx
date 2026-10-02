import ToolPage from "@/pages/ToolPage";
import { getToolPageByPath } from "@/content/tool-pages";
import { createSeoMeta, notFoundPageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";
import type { Route } from "./+types/tool";

export const meta = ({ location }: Route.MetaArgs) => {
  const tool = getToolPageByPath(location.pathname);
  if (!tool) {
    return notFoundPageMeta("Tool not found");
  }
  return createSeoMeta(createToolSeoPage(tool));
};

export const handle = { languageAlternates: (path: string) => getToolPageByPath(path)?.alternates };
export default ToolPage;
