import LandingPage from "@/pages/LandingPage";
import { getLandingPageByPath } from "@/content/landing-pages";
import { createLandingSeoPage } from "@/seo/landing-page";
import { createSeoMeta, notFoundPageMeta } from "@/seo/page";
import type { Route } from "./+types/use-case";

export const meta = ({ location }: Route.MetaArgs) => {
  const page = getLandingPageByPath(location.pathname);
  if (!page) {
    return notFoundPageMeta();
  }
  return createSeoMeta(createLandingSeoPage(page));
};

export const handle = {
  languageAlternates: (path: string) => getLandingPageByPath(path)?.alternates,
};
export default LandingPage;
