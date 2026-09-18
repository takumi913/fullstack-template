import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { indexableSeoPages } from "../src/seo/pages";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, "..", "dist", "client");
const siteUrl = (process.env.VITE_SITE_URL || "https://example.com").replace(/\/$/, "");

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexableSeoPages
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

const notFound = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>404 - 页面不存在</title>
  </head>
  <body>
    <main>
      <h1>404</h1>
      <p>页面不存在。</p>
      <a href="/">返回首页</a>
    </main>
  </body>
</html>
`;

await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(join(outputDir, "sitemap.xml"), sitemap),
  writeFile(join(outputDir, "robots.txt"), robots),
  writeFile(join(outputDir, "404.html"), notFound),
]);

console.log(`SEO files generated for ${indexableSeoPages.length} indexable pages.`);
