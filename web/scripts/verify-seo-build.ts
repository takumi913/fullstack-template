import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { directoryLandingPages, getLandingPagesForTool, routableLandingPages } from "../src/content/landing-pages";
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

const home = await readOutput("index.html");
assertIncludes(home, publicSeoPages.home.title, "home HTML");
assertIncludes(home, 'rel="canonical"', "home HTML");
assertIncludes(home, `href="${siteConfig.url}/"`, "home canonical");
assertIncludes(home, "application/ld+json", "home HTML");

const toolsHub = await readOutput("tools", "index.html");
assertIncludes(toolsHub, publicSeoPages.tools.title, "tools hub HTML");
assertIncludes(toolsHub, "noindex, follow", "tools hub HTML");
assertIncludes(toolsHub, 'lang="en"', "tools hub document language");

const resourcesHub = await readOutput("resources", "index.html");
assertIncludes(resourcesHub, publicSeoPages.resources.title, "resources hub HTML");
assertIncludes(resourcesHub, "noindex, follow", "resources hub HTML");
for (const page of directoryLandingPages) {
  assertIncludes(resourcesHub, `href="${page.path}"`, `resources hub -> ${page.path}`);
}

for (const tool of routableToolPages) {
  const html = await readOutput(...htmlOutputParts(toolPath(tool)));
  const seo = createToolSeoPage(tool);

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

const notFound = await readOutput("404.html");
assertIncludes(notFound, "404 - Page not found", "404 HTML");
assertIncludes(notFound, "noindex, nofollow", "404 HTML");
await assertOutputMissing("404", "index.html");

const spaFallback = await readOutput("__spa-fallback.html");
assertIncludes(spaFallback, "noindex, nofollow", "SPA fallback HTML");

const redirects = await readOutput("_redirects");
assertExcludes(redirects, "/404.html                404", "Cloudflare redirects");

const robots = await readOutput("robots.txt");
assertIncludes(robots, `Sitemap: ${siteConfig.url}/sitemap.xml`, "robots.txt");

for (const page of routableLandingPages) {
  const html = await readOutput(...htmlOutputParts(page.path));
  const seo = createLandingSeoPage(page);

  assertIncludes(html, page.title, `${page.slug} landing HTML`);
  assertIncludes(html, page.h1, `${page.slug} landing HTML`);
  assertIncludes(html, 'rel="canonical"', `${page.slug} landing HTML`);
  assertIncludes(html, "BreadcrumbList", `${page.slug} landing HTML`);
  assertIncludes(html, "WebPage", `${page.slug} landing HTML`);

  if (seo.noindex) {
    assertIncludes(html, "noindex, follow", `${page.slug} landing HTML`);
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
