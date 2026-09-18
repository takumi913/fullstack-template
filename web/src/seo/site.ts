import { templateSiteConfig } from "../config/site-config";
import { normalizeSiteUrl, placeholderSiteUrl } from "./site-url";

export const siteConfig = {
  name: import.meta.env.VITE_SITE_NAME || templateSiteConfig.brand.name,
  shortName: import.meta.env.VITE_SITE_SHORT_NAME || templateSiteConfig.brand.shortName,
  mark: import.meta.env.VITE_SITE_MARK || templateSiteConfig.brand.mark,
  favicon: import.meta.env.VITE_SITE_FAVICON || templateSiteConfig.brand.favicon,
  url: normalizeSiteUrl(import.meta.env.VITE_SITE_URL || placeholderSiteUrl),
  locale: import.meta.env.VITE_SITE_LOCALE || templateSiteConfig.seo.locale,
  primaryKeyword:
    import.meta.env.VITE_SITE_PRIMARY_KEYWORD || templateSiteConfig.seo.primaryKeyword,
  defaultTitle: import.meta.env.VITE_SITE_TITLE || templateSiteConfig.seo.defaultTitle,
  defaultDescription:
    import.meta.env.VITE_SITE_DESCRIPTION || templateSiteConfig.seo.defaultDescription,
  defaultImage: import.meta.env.VITE_SITE_IMAGE || templateSiteConfig.seo.defaultImage,
} as const;

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
