import { templateSiteConfig } from "./site-config";

export interface SiteBuildEnvironment {
  VITE_SITE_NAME?: string;
  VITE_SITE_SHORT_NAME?: string;
  VITE_SITE_MARK?: string;
  VITE_SITE_FAVICON?: string;
  VITE_SITE_LOCALE?: string;
  VITE_SITE_PRIMARY_KEYWORD?: string;
  VITE_SITE_TITLE?: string;
  VITE_SITE_DESCRIPTION?: string;
  VITE_SITE_IMAGE?: string;
}

function configured(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized || fallback;
}

export function resolveSiteConfig(env: SiteBuildEnvironment) {
  return {
    name: configured(env.VITE_SITE_NAME, templateSiteConfig.brand.name),
    shortName: configured(env.VITE_SITE_SHORT_NAME, templateSiteConfig.brand.shortName),
    mark: configured(env.VITE_SITE_MARK, templateSiteConfig.brand.mark),
    favicon: configured(env.VITE_SITE_FAVICON, templateSiteConfig.brand.favicon),
    locale: configured(env.VITE_SITE_LOCALE, templateSiteConfig.seo.locale),
    primaryKeyword: configured(
      env.VITE_SITE_PRIMARY_KEYWORD,
      templateSiteConfig.seo.primaryKeyword,
    ),
    defaultTitle: configured(env.VITE_SITE_TITLE, templateSiteConfig.seo.defaultTitle),
    defaultDescription: configured(
      env.VITE_SITE_DESCRIPTION,
      templateSiteConfig.seo.defaultDescription,
    ),
    defaultImage: configured(env.VITE_SITE_IMAGE, templateSiteConfig.seo.defaultImage),
  } as const;
}
