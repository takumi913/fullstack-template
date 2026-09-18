import ToolPage from "@/pages/ToolPage";
import { getToolPageByPath } from "@/content/tool-pages";
import { createSeoMeta, privatePageMeta } from "@/seo/page";
import { createToolSeoPage } from "@/seo/tool-page";
import type { Route } from "./+types/localized-tool";

export const meta = ({ params }: Route.MetaArgs) => {
  const path = `/${params.locale}/tools/${params.slug}`;
  const tool = getToolPageByPath(path);

  if (!tool) {
    return [{ title: "Tool not found | Fullstack Template" }, ...privatePageMeta];
  }

  return createSeoMeta(createToolSeoPage(tool));
};

export default ToolPage;
