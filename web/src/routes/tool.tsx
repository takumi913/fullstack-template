import ToolPage from "@/pages/ToolPage";
import { getToolPageBySlug } from "@/content/tool-pages";
import { createSeoMeta, notFoundPageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";
import type { Route } from "./+types/tool";

export const meta = ({ params }: Route.MetaArgs) => {
  const tool = getToolPageBySlug(params.slug);
  if (!tool) {
    return notFoundPageMeta("Tool not found");
  }
  return createSeoMeta(createToolSeoPage(tool));
};

export default ToolPage;
