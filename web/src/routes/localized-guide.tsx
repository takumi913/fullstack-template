import LandingPage from "@/pages/LandingPage";
import { getLandingPageByPath } from "@/content/landing-pages";
import { createLandingSeoPage } from "@/seo/landing-page";
import { createSeoMeta, privatePageMeta } from "@/seo/page";
import type { Route } from "./+types/localized-guide";

export const meta = ({ params }: Route.MetaArgs) => {
  const page = getLandingPageByPath(`/${params.locale}/guides/${params.slug}`);
  if (!page) {
    return [{ title: "Page not found | Fullstack Template" }, ...privatePageMeta];
  }
  return createSeoMeta(createLandingSeoPage(page));
};

export default LandingPage;
