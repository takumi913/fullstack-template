import TermsPage from "@/pages/TermsPage";
import { createSeoMeta } from "@/seo/page";
import { publicSeoPages } from "@/seo/pages";

export const meta = () => createSeoMeta(publicSeoPages.terms);

export default TermsPage;
