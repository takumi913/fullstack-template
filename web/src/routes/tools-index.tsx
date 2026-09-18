import ToolsPage from "@/pages/ToolsPage";
import { createSeoMeta } from "@/seo/page";
import { publicSeoPages } from "@/seo/pages";

export const meta = () => createSeoMeta(publicSeoPages.tools);

export default ToolsPage;
