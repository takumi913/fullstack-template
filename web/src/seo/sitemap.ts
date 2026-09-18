import type { SeoPage } from "./page";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function assertValidLastmod(value: string, path: string, now: Date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Sitemap lastmod must use YYYY-MM-DD: ${path} -> ${value}`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Sitemap lastmod is not a valid calendar date: ${path} -> ${value}`);
  }

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (parsed > today) {
    throw new Error(`Sitemap lastmod cannot be in the future: ${path} -> ${value}`);
  }
}

export function createSitemapXml(siteUrl: string, pages: readonly SeoPage[], now = new Date()) {
  const sitemapPaths = new Set(pages.map((page) => page.path));

  for (const page of pages) {
    if (page.updatedAt) {
      assertValidLastmod(page.updatedAt, page.path, now);
    }
  }
  const hasAlternates = pages.some((page) => (page.alternates?.length || 0) > 0);

  for (const page of pages) {
    for (const alternate of page.alternates || []) {
      if (!sitemapPaths.has(alternate.path)) {
        throw new Error(
          `Sitemap hreflang target must be indexable and included in the sitemap: ${page.path} -> ${alternate.path}`,
        );
      }
    }
  }

  const namespace = hasAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : "";

  const entries = pages
    .map((page) => {
      const alternates = (page.alternates || [])
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(siteUrl + alternate.path)}" />`,
        )
        .join("\n");

      const details = [
        `    <loc>${escapeXml(siteUrl + page.path)}</loc>`,
        page.updatedAt ? `    <lastmod>${escapeXml(page.updatedAt)}</lastmod>` : "",
        alternates,
      ]
        .filter(Boolean)
        .join("\n");

      return `  <url>\n${details}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${namespace}>\n${entries}\n</urlset>\n`;
}
