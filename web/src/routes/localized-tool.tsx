import ToolPage from "@/pages/ToolPage";
import { getToolPageByPath } from "@/content/tool-pages";
import { createSeoMeta, notFoundPageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";
import type { Route } from "./+types/localized-tool";

export const meta = ({ params }: Route.MetaArgs) => {
  const path = `/${params.locale}/tools/${params.slug}`;
  const tool = getToolPageByPath(path);

  if (!tool) {
    return notFoundPageMeta("Tool not found");
  }

  return createSeoMeta(createToolSeoPage(tool));
};

export default ToolPage;
