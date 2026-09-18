import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { templateSiteConfig } from "../src/config/site-config";
import { routableLandingPages } from "../src/content/landing-pages";
import { routableToolPages } from "../src/content/tool-pages";
import { indexableSeoPages } from "../src/seo/pages";
import { publicAssetMimeType } from "../src/seo/public-asset";
import { createLandingSeoPage } from "../src/seo/landing-page";
import { createToolSeoPage } from "../src/seo/tool-page";
import { createSitemapXml } from "../src/seo/sitemap";
import { runSeoPreflight } from "../src/seo/preflight";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, "..", "dist", "client");
const { siteUrl, resolvedSite } = runSeoPreflight(process.env);

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const siteName = resolvedSite.name;
const siteShortName = resolvedSite.shortName;
const siteTitle = resolvedSite.defaultTitle;
const siteDescription = resolvedSite.defaultDescription;
const siteMark = resolvedSite.mark;
const siteImage = resolvedSite.defaultImage;
const siteFavicon = resolvedSite.favicon;

function generateDefaultFavicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${templateSiteConfig.appearance.iconBackground}"/>
  <text x="32" y="42" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="${templateSiteConfig.appearance.iconForeground}" text-anchor="middle">${escapeXml(siteMark.slice(0, 2))}</text>
</svg>
`;
}

const manifest = JSON.stringify(
  {
    name: siteName,
    short_name: siteShortName,
    start_url: "/",
    display: "standalone",
    background_color: templateSiteConfig.appearance.backgroundColor,
    theme_color: templateSiteConfig.appearance.themeColor,
    icons: [
      {
        src: siteFavicon,
        sizes: siteFavicon.endsWith(".svg") ? "any" : "512x512",
        type: publicAssetMimeType(siteFavicon) || "image/*",
      },
    ],
  },
  null,
  2,
);

function generateDefaultOgImage() {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f4f4f5"/>
  <rect x="48" y="48" width="1104" height="534" rx="28" fill="white" stroke="#e4e4e7" stroke-width="2"/>
  <rect x="104" y="140" width="76" height="76" rx="15" fill="#18181b"/>
  <text x="142" y="190" font-family="system-ui, sans-serif" font-size="30" font-weight="700" fill="white" text-anchor="middle">${escapeXml(siteMark.slice(0, 2))}</text>
  <text x="204" y="184" font-family="system-ui, sans-serif" font-size="40" font-weight="700" fill="#18181b">${escapeXml(siteName)}</text>
  <text x="104" y="304" font-family="system-ui, sans-serif" font-size="50" font-weight="700" fill="#18181b">${escapeXml(siteTitle.slice(0, 46))}</text>
  <text x="104" y="370" font-family="system-ui, sans-serif" font-size="24" fill="#52525b">${escapeXml(siteDescription.slice(0, 88))}</text>
  <text x="104" y="504" font-family="system-ui, sans-serif" font-size="20" fill="#71717a">${escapeXml(siteUrl)}</text>
</svg>
`;
}

const toolSeoPages = routableToolPages.map(createToolSeoPage).filter((page) => !page.noindex);
const landingSeoPages = routableLandingPages
  .map(createLandingSeoPage)
  .filter((page) => !page.noindex);
const sitemapPages = [...indexableSeoPages, ...toolSeoPages, ...landingSeoPages];

const sitemap = createSitemapXml(siteUrl, sitemapPages);

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

const generatedFiles = [
  writeFile(join(outputDir, "sitemap.xml"), sitemap),
  writeFile(join(outputDir, "robots.txt"), robots),
  writeFile(join(outputDir, "manifest.webmanifest"), manifest + "\n"),
  writeFile(join(outputDir, "404.html"), notFound),
  writeFile(spaFallbackPath, protectedSpaFallback),
];

if (siteImage === "/og-image.svg") {
  generatedFiles.push(writeFile(join(outputDir, "og-image.svg"), generateDefaultOgImage()));
}

if (siteFavicon === "/favicon.svg") {
  generatedFiles.push(writeFile(join(outputDir, "favicon.svg"), generateDefaultFavicon()));
}

await Promise.all(generatedFiles);

// /404 只用于生成统一的 React 404 文档，最终不能保留为可返回 200 的静态页面。
await rm(join(outputDir, "404"), { recursive: true, force: true });

if (!process.env.VITE_SITE_URL) {
  console.warn("SEO warning: VITE_SITE_URL is not set; using https://example.com.");
}

console.log(`SEO files generated for ${sitemapPages.length} indexable pages.`);
