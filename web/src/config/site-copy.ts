import { toolsmithCopies } from "./toolsmith-copy";

function createSiteCopy(copy: typeof toolsmithCopies.en) {
  return {
    home: {
      title: `${copy.h1a} ${copy.h1b}`,
      primaryKeyword: copy.h1b,
      description: `${copy.fTag} ${copy.h1a} ${copy.h1b}`,
      headline: copy.h1a,
      headlineAccent: copy.h1b,
      trust: copy.heroSub,
      moreTools: copy.toolsTitle,
      browseTools: copy.viewAll,
      closingTitle: copy.ctaTitle,
      closingDescription: copy.ctaSub,
      closingCta: copy.ctaBtn,
    },
    hubs: {
      tools: {
        eyebrow: copy.dirEyebrow,
        primaryKeyword: copy.dirEyebrow,
        title: copy.dirTitle,
        description: copy.dirSub,
      },
      resources: {
        eyebrow: copy.navBlog,
        primaryKeyword: copy.blogTitle,
        title: copy.blogTitle,
        description: copy.blogSub,
      },
      pricing: {
        eyebrow: copy.priceEyebrow,
        primaryKeyword: copy.priceEyebrow,
        title: copy.priceTitle,
        description: copy.priceSub,
      },
    },
  };
}
export const siteCopies = {
  en: createSiteCopy(toolsmithCopies.en),
  "zh-CN": createSiteCopy(toolsmithCopies["zh-CN"]),
};
