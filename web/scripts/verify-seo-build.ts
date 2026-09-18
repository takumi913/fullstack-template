import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  directoryLandingPages,
  getLandingPagesForTool,
  routableLandingPages,
} from "../src/content/landing-pages";
import { routableToolPages, toolPath } from "../src/content/tool-pages";
import { createLandingSeoPage } from "../src/seo/landing-page";
import { publicSeoPages } from "../src/seo/pages";
import { createToolSeoPage } from "../src/seo/tool-page";
import { siteConfig } from "../src/seo/site";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const clientDir = join(scriptDir, "..", "dist", "client");

async function readOutput(...parts: string[]) {
  return readFile(join(clientDir, ...parts), "utf8");
}

function htmlOutputParts(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return [...segments, "index.html"];
}

async function assertOutputExists(...parts: string[]) {
  const path = join(clientDir, ...parts);
  await access(path);
}

async function assertOutputMissing(...parts: string[]) {
  const path = join(clientDir, ...parts);
  try {
    await access(path);
  } catch {
    return;
  }
  throw new Error(`expected generated output to be absent: ${path}`);
}

function assertIncludes(content: string, expected: string, label: string) {
  if (!content.includes(expected)) {
    throw new Error(`${label}: expected to include ${JSON.stringify(expected)}`);
  }
}

function assertExcludes(content: string, unexpected: string, label: string) {
  if (content.includes(unexpected)) {
    throw new Error(`${label}: expected to exclude ${JSON.stringify(unexpected)}`);
  }
}

function assertMatches(content: string, pattern: RegExp, label: string) {
  if (!pattern.test(content)) {
    throw new Error(`${label}: expected to match ${pattern}`);
  }
}

function assertPublicHtmlDoesNotLoadPrivateApp(html: string, label: string) {
  for (const privateChunk of ["authStore-", "RouteGuards-", "tenantStore-"]) {
    assertExcludes(html, privateChunk, `${label} private app bundle`);
  }
}

function assertStaticHtmlDoesNotHydrate(html: string, label: string) {
  assertExcludes(html, "entry.client-", `${label} client runtime`);
}

function assertHydratedHtml(html: string, label: string) {
  assertIncludes(html, "entry.client-", `${label} client runtime`);
}

const home = await readOutput("index.html");
assertIncludes(home, publicSeoPages.home.title, "home HTML");
assertIncludes(home, `href="${siteConfig.favicon}"`, "home favicon");
assertIncludes(home, 'rel="manifest"', "home manifest link");
assertIncludes(home, 'rel="canonical"', "home HTML");
assertIncludes(home, `href="${siteConfig.url}/"`, "home canonical");
assertIncludes(home, "application/ld+json", "home HTML");
assertPublicHtmlDoesNotLoadPrivateApp(home, "home HTML");
assertStaticHtmlDoesNotHydrate(home, "home HTML");

const toolsHub = await readOutput("tools", "index.html");
assertIncludes(toolsHub, publicSeoPages.tools.title, "tools hub HTML");
assertIncludes(toolsHub, "noindex, follow", "tools hub HTML");
assertIncludes(toolsHub, 'lang="en"', "tools hub document language");
assertPublicHtmlDoesNotLoadPrivateApp(toolsHub, "tools hub HTML");
assertStaticHtmlDoesNotHydrate(toolsHub, "tools hub HTML");

const resourcesHub = await readOutput("resources", "index.html");
assertIncludes(resourcesHub, publicSeoPages.resources.title, "resources hub HTML");
assertIncludes(resourcesHub, "noindex, follow", "resources hub HTML");
assertPublicHtmlDoesNotLoadPrivateApp(resourcesHub, "resources hub HTML");
assertStaticHtmlDoesNotHydrate(resourcesHub, "resources hub HTML");

for (const page of Object.values(publicSeoPages)) {
  if (!("noindex" in page) || !page.noindex) continue;
  const html = await readOutput(...htmlOutputParts(page.path));
  assertIncludes(html, "noindex, follow", `${page.path} public noindex HTML`);
}

for (const page of directoryLandingPages) {
  assertIncludes(resourcesHub, `href="${page.path}"`, `resources hub -> ${page.path}`);
}

for (const tool of routableToolPages) {
  const html = await readOutput(...htmlOutputParts(toolPath(tool)));
  const seo = createToolSeoPage(tool);

  assertPublicHtmlDoesNotLoadPrivateApp(html, `${tool.slug} HTML`);
  assertHydratedHtml(html, `${tool.slug} HTML`);
  assertIncludes(html, tool.title, `${tool.slug} HTML`);
  assertIncludes(html, tool.h1, `${tool.slug} HTML`);
  assertIncludes(html, 'rel="canonical"', `${tool.slug} HTML`);
  assertIncludes(html, "BreadcrumbList", `${tool.slug} HTML`);
  assertIncludes(html, "WebApplication", `${tool.slug} HTML`);
  assertIncludes(
    html,
    `lang="${tool.locale || siteConfig.locale}"`,
    `${tool.slug} document language`,
  );

  if (seo.noindex) {
    assertIncludes(html, "noindex, follow", `${tool.slug} HTML`);
  }

  for (const resource of getLandingPagesForTool(tool.slug)) {
    assertIncludes(html, `href="${resource.path}"`, `${tool.slug} -> ${resource.path}`);
  }

  for (const alternate of tool.alternates || []) {
    assertMatches(
      html,
      new RegExp(`hrefLang="${alternate.hreflang}"`, "i"),
      `${tool.slug} hreflang`,
    );
    assertIncludes(html, `href="${siteConfig.url}${alternate.path}"`, `${tool.slug} alternate URL`);
  }
}

const jsonFormatterHtml = await readOutput("tools", "json-formatter", "index.html");
assertIncludes(jsonFormatterHtml, "JSON input", "json formatter prerender");

const wordCounterHtml = await readOutput("tools", "word-counter", "index.html");
assertIncludes(wordCounterHtml, "word-counter-input", "word counter prerender");

const japaneseJsonFormatterHtml = await readOutput("ja", "tools", "json-formatter", "index.html");
assertIncludes(japaneseJsonFormatterHtml, 'lang="ja"', "Japanese JSON formatter language");
assertIncludes(japaneseJsonFormatterHtml, "JSON 整形ツール", "Japanese JSON formatter content");

const japaneseJsonGuideHtml = await readOutput("ja", "guides", "json-syntax", "index.html");
assertIncludes(japaneseJsonGuideHtml, 'lang="ja"', "Japanese JSON guide language");
assertIncludes(japaneseJsonGuideHtml, "JSON 構文ガイド", "Japanese JSON guide content");

const notFound = await readOutput("404.html");
assertIncludes(notFound, "404 - Page not found", "404 HTML");
assertIncludes(notFound, "noindex, nofollow", "404 HTML");
assertStaticHtmlDoesNotHydrate(notFound, "404 HTML");
await assertOutputMissing("404", "index.html");

const spaFallback = await readOutput("__spa-fallback.html");
assertIncludes(spaFallback, "noindex, nofollow", "SPA fallback HTML");
assertHydratedHtml(spaFallback, "SPA fallback HTML");

const redirects = await readOutput("_redirects");
assertExcludes(redirects, "/404.html                404", "Cloudflare redirects");
for (const rule of [
  "/tools/                 /tools                  301",
  "/tools/:slug/           /tools/:slug            301",
  "/:locale/tools/:slug/       /:locale/tools/:slug        301",
  "/:locale/use-cases/:slug/   /:locale/use-cases/:slug    301",
  "/:locale/compare/:slug/     /:locale/compare/:slug      301",
  "/:locale/guides/:slug/      /:locale/guides/:slug       301",
  "/resources/             /resources              301",
  "/use-cases/:slug/       /use-cases/:slug        301",
  "/compare/:slug/         /compare/:slug          301",
  "/guides/:slug/          /guides/:slug           301",
]) {
  assertIncludes(redirects, rule, "Cloudflare canonical redirects");
}

const robots = await readOutput("robots.txt");
assertIncludes(robots, `Sitemap: ${siteConfig.url}/sitemap.xml`, "robots.txt");

const manifest = await readOutput("manifest.webmanifest");
assertIncludes(manifest, `"name": "${siteConfig.name}"`, "web manifest brand");
assertIncludes(manifest, `"short_name": "${siteConfig.shortName}"`, "web manifest short name");
assertIncludes(manifest, `"src": "${siteConfig.favicon}"`, "web manifest favicon");

if (siteConfig.favicon === "/favicon.svg") {
  const favicon = await readOutput("favicon.svg");
  assertIncludes(favicon, siteConfig.mark.slice(0, 2), "generated favicon mark");
} else if (siteConfig.favicon.startsWith("/")) {
  await assertOutputExists(...siteConfig.favicon.split("/").filter(Boolean));
}

await assertOutputMissing("favicon.ico");
await assertOutputMissing("vite.svg");

if (siteConfig.defaultImage === "/og-image.svg") {
  const ogImage = await readOutput("og-image.svg");
  assertIncludes(ogImage, siteConfig.name, "generated OG image brand");
  assertIncludes(ogImage, siteConfig.defaultTitle.slice(0, 46), "generated OG image title");
  assertExcludes(ogImage, "MDZZ Toolbox", "generated OG image");
  assertExcludes(ogImage, "mdzz.uk", "generated OG image");
} else if (siteConfig.defaultImage.startsWith("/")) {
  await assertOutputExists(...siteConfig.defaultImage.split("/").filter(Boolean));
}

for (const page of routableLandingPages) {
  const html = await readOutput(...htmlOutputParts(page.path));
  const seo = createLandingSeoPage(page);

  assertPublicHtmlDoesNotLoadPrivateApp(html, `${page.slug} landing HTML`);
  assertStaticHtmlDoesNotHydrate(html, `${page.slug} landing HTML`);
  assertIncludes(html, page.title, `${page.slug} landing HTML`);
  assertIncludes(html, page.h1, `${page.slug} landing HTML`);
  assertIncludes(html, 'rel="canonical"', `${page.slug} landing HTML`);
  assertIncludes(html, "BreadcrumbList", `${page.slug} landing HTML`);
  assertIncludes(html, "WebPage", `${page.slug} landing HTML`);

  if (seo.noindex) {
    assertIncludes(html, "noindex, follow", `${page.slug} landing HTML`);
  }

  for (const alternate of page.alternates || []) {
    assertMatches(
      html,
      new RegExp(`hrefLang="${alternate.hreflang}"`, "i"),
      `${page.slug} landing hreflang`,
    );
    assertIncludes(
      html,
      `href="${siteConfig.url}${alternate.path}"`,
      `${page.slug} landing alternate URL`,
    );
  }
}

const sitemap = await readOutput("sitemap.xml");
assertIncludes(sitemap, `<loc>${siteConfig.url}/</loc>`, "sitemap");

for (const page of Object.values(publicSeoPages)) {
  if ("noindex" in page && page.noindex) {
    assertExcludes(sitemap, page.path, "sitemap");
  }
}

for (const tool of routableToolPages) {
  const seo = createToolSeoPage(tool);
  const path = toolPath(tool);

  if (seo.noindex) {
    assertExcludes(sitemap, path, "sitemap");
  } else {
    assertIncludes(sitemap, path, "sitemap");
  }
}

for (const page of routableLandingPages) {
  const seo = createLandingSeoPage(page);

  if (seo.noindex) {
    assertExcludes(sitemap, page.path, "sitemap");
  } else {
    assertIncludes(sitemap, page.path, "sitemap");
  }
}

console.log("SEO build verification passed.");
