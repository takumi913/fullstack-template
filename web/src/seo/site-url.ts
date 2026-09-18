export const placeholderSiteUrl = "https://example.com";

export function normalizeSiteUrl(value: string) {
  const normalized = value.trim().replace(/\/$/, "");
  const url = new URL(normalized);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("VITE_SITE_URL must use http or https");
  }

  if (url.search || url.hash) {
    throw new Error("VITE_SITE_URL must not contain a query string or hash");
  }

  if (url.pathname !== "/") {
    throw new Error("VITE_SITE_URL must be an origin without a path");
  }

  return url.origin;
}

export function assertSeoBuildSiteUrl(rawValue: string | undefined, strict: boolean) {
  const normalized = normalizeSiteUrl(rawValue || placeholderSiteUrl);

  if (strict && (!rawValue || normalized === placeholderSiteUrl)) {
    throw new Error(
      "SEO_STRICT=true requires VITE_SITE_URL to be set to the production site origin",
    );
  }

  return normalized;
}
