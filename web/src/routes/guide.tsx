import LandingPage from "@/pages/LandingPage";
import { getLandingPageByPath } from "@/content/landing-pages";
import { createLandingSeoPage } from "@/seo/landing-page";
import { createSeoMeta, notFoundPageMeta } from "@/seo/page";
import type { Route } from "./+types/guide";

export const meta = ({ params }: Route.MetaArgs) => {
  const page = getLandingPageByPath(`/guides/${params.slug}`);
  if (!page) {
    return notFoundPageMeta();
  }
  return createSeoMeta(createLandingSeoPage(page));
};

export default LandingPage;
