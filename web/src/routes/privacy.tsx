import PrivacyPage from "@/pages/PrivacyPage";
import { createSeoMeta } from "@/seo/page";
import { publicSeoPages } from "@/seo/pages";

export const meta = () => createSeoMeta(publicSeoPages.privacy);

export default PrivacyPage;
