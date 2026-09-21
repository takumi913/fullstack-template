import ResourcesPage from "@/pages/ResourcesPage";
import { createSeoMeta } from "@/seo/page";
import { publicSeoPages } from "@/seo/pages";

export const meta = () => createSeoMeta(publicSeoPages.resources);

export default ResourcesPage;
