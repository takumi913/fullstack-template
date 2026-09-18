import { resolveSiteConfig } from "../config/resolve-site-config";
import { normalizeSiteUrl, placeholderSiteUrl } from "./site-url";

const resolvedSiteConfig = resolveSiteConfig(import.meta.env);

export const siteConfig = {
  ...resolvedSiteConfig,
  url: normalizeSiteUrl(import.meta.env.VITE_SITE_URL || placeholderSiteUrl),
} as const;

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}
