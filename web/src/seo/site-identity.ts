import { templateSiteConfig } from "../config/site-config";

export interface SeoSiteIdentityInput {
  name?: string;
  title?: string;
  description?: string;
}

function normalized(value: string | undefined) {
  return value?.trim() || "";
}

export function assertSeoBuildSiteIdentity(input: SeoSiteIdentityInput, strict: boolean) {
  if (!strict) return;

  const name = normalized(input.name);
  const title = normalized(input.title);
  const description = normalized(input.description);

  if (!name || name === templateSiteConfig.brand.name) {
    throw new Error(
      "SEO_STRICT=true requires VITE_SITE_NAME to be explicitly customized from the template default",
    );
  }

  if (!title || title === templateSiteConfig.seo.defaultTitle) {
    throw new Error(
      "SEO_STRICT=true requires VITE_SITE_TITLE to be explicitly customized from the template default",
    );
  }

  if (!description || description === templateSiteConfig.seo.defaultDescription) {
    throw new Error(
      "SEO_STRICT=true requires VITE_SITE_DESCRIPTION to be explicitly customized from the template default",
    );
  }
}
