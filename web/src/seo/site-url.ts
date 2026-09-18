export const placeholderSiteUrl = "https://example.com";

const reservedSuffixes = [".localhost", ".test", ".example", ".invalid"];
const reservedExampleDomains = ["example.com", "example.net", "example.org"];

function isReservedSeoHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1") {
    return true;
  }

  if (reservedSuffixes.some((suffix) => normalized.endsWith(suffix))) {
    return true;
  }

  return reservedExampleDomains.some(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`),
  );
}

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

  if (strict) {
    const hostname = new URL(normalized).hostname;

    if (!rawValue || isReservedSeoHostname(hostname)) {
      throw new Error(
        "SEO_STRICT=true requires VITE_SITE_URL to use a non-placeholder production hostname",
      );
    }
  }

  return normalized;
}
