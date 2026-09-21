import HomePage from "@/pages/HomePage";
import { createSeoMeta } from "@/seo/page";
import { publicSeoPages } from "@/seo/pages";

export const meta = () => createSeoMeta(publicSeoPages.home);

export default HomePage;
