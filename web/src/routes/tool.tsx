import ToolPage from "@/pages/ToolPage";
import { getToolPageByPath } from "@/content/tool-pages";
import { createSeoMeta, notFoundPageMeta, withPageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";

export const meta = (pathname: string) => {
  const tool = getToolPageByPath(pathname);
  if (!tool) {
    return notFoundPageMeta("Tool not found");
  }
  return createSeoMeta(createToolSeoPage(tool));
};

export default withPageMeta(ToolPage, meta);
