import LandingPage from "@/pages/LandingPage";
import { getLandingPageByPath } from "@/content/landing-pages";
import { createLandingSeoPage } from "@/seo/landing-page";
import { createSeoMeta, notFoundPageMeta, withPageMeta } from "@/seo/page";

export const meta = (pathname: string) => {
  const page = getLandingPageByPath(pathname);
  if (!page) {
    return notFoundPageMeta();
  }
  return createSeoMeta(createLandingSeoPage(page));
};

export default withPageMeta(LandingPage, meta);
