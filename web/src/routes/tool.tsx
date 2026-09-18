import ToolPage from "@/pages/ToolPage";
import { getToolPageBySlug } from "@/content/tool-pages";
import { createSeoMeta, privatePageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";
import type { Route } from "./+types/tool";

export const meta = ({ params }: Route.MetaArgs) => {
  const tool = getToolPageBySlug(params.slug);
  if (!tool) {
    return [{ title: "Tool not found | Fullstack Template" }, ...privatePageMeta];
  }
  return createSeoMeta(createToolSeoPage(tool));
};

export default ToolPage;
