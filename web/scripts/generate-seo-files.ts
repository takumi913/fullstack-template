import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { routableLandingPages } from "../src/content/landing-pages";
import { routableToolPages } from "../src/content/tool-pages";
import { indexableSeoPages } from "../src/seo/pages";
import { createLandingSeoPage } from "../src/seo/landing-page";
import { createToolSeoPage } from "../src/seo/tool-page";
import { assertSeoBuildSiteUrl } from "../src/seo/site-url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, "..", "dist", "client");
const strictSeo = process.env.SEO_STRICT === "true";
const siteUrl = assertSeoBuildSiteUrl(process.env.VITE_SITE_URL, strictSeo);

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const toolSeoPages = routableToolPages.map(createToolSeoPage).filter((page) => !page.noindex);
const landingSeoPages = routableLandingPages
  .map(createLandingSeoPage)
  .filter((page) => !page.noindex);
const sitemapPages = [...indexableSeoPages, ...toolSeoPages, ...landingSeoPages];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages
  .map(
    (page) => `  <url>
    <loc>${escapeXml(siteUrl + page.path)}</loc>${
      page.updatedAt ? `\n    <lastmod>${page.updatedAt}</lastmod>` : ""
    }
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(outputDir, { recursive: true });
const notFound = await readFile(join(outputDir, "404", "index.html"), "utf8");
const spaFallbackPath = join(outputDir, "__spa-fallback.html");
const spaFallback = await readFile(spaFallbackPath, "utf8");
const noindexMeta = '<meta name="robots" content="noindex, nofollow">';
const protectedSpaFallback = /<meta[^>]+name=["']robots["'][^>]*>/i.test(spaFallback)
  ? spaFallback.replace(/<meta[^>]+name=["']robots["'][^>]*>/i, noindexMeta)
  : spaFallback.replace("</head>", `${noindexMeta}</head>`);

await Promise.all([
  writeFile(join(outputDir, "sitemap.xml"), sitemap),
  writeFile(join(outputDir, "robots.txt"), robots),
  writeFile(join(outputDir, "404.html"), notFound),
  writeFile(spaFallbackPath, protectedSpaFallback),
]);

// /404 只用于生成统一的 React 404 文档，最终不能保留为可返回 200 的静态页面。
await rm(join(outputDir, "404"), { recursive: true, force: true });

if (!process.env.VITE_SITE_URL) {
  console.warn("SEO warning: VITE_SITE_URL is not set; using https://example.com.");
}

console.log(`SEO files generated for ${sitemapPages.length} indexable pages.`);
