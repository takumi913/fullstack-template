import type { SeoPage } from "./page";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createSitemapXml(siteUrl: string, pages: readonly SeoPage[]) {
  const sitemapPaths = new Set(pages.map((page) => page.path));
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
