import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { routableToolPages, toolPath } from "../src/content/tool-pages";
import { publicSeoPages } from "../src/seo/pages";
import { createToolSeoPage } from "../src/seo/tool-page";
import { siteConfig } from "../src/seo/site";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const clientDir = join(scriptDir, "..", "dist", "client");

async function readOutput(...parts: string[]) {
  return readFile(join(clientDir, ...parts), "utf8");
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

const home = await readOutput("index.html");
assertIncludes(home, publicSeoPages.home.title, "home HTML");
assertIncludes(home, 'rel="canonical"', "home HTML");
assertIncludes(home, `href="${siteConfig.url}/"`, "home canonical");
assertIncludes(home, "application/ld+json", "home HTML");

const toolsHub = await readOutput("tools", "index.html");
assertIncludes(toolsHub, publicSeoPages.tools.title, "tools hub HTML");
assertIncludes(toolsHub, "noindex, nofollow", "tools hub HTML");
assertIncludes(toolsHub, 'lang="en"', "tools hub document language");

for (const tool of routableToolPages) {
  const html = await readOutput("tools", tool.slug, "index.html");
  const seo = createToolSeoPage(tool);

  assertIncludes(html, tool.title, `${tool.slug} HTML`);
  assertIncludes(html, tool.h1, `${tool.slug} HTML`);
  assertIncludes(html, 'rel="canonical"', `${tool.slug} HTML`);
  assertIncludes(html, "BreadcrumbList", `${tool.slug} HTML`);
  assertIncludes(html, "WebApplication", `${tool.slug} HTML`);
  assertIncludes(html, `lang="${tool.locale || siteConfig.locale}"`, `${tool.slug} document language`);

  if (seo.noindex) {
    assertIncludes(html, "noindex, nofollow", `${tool.slug} HTML`);
  }
}

const jsonFormatterHtml = await readOutput("tools", "json-formatter", "index.html");
assertIncludes(jsonFormatterHtml, "JSON input", "json formatter prerender");

const wordCounterHtml = await readOutput("tools", "word-counter", "index.html");
assertIncludes(wordCounterHtml, "word-counter-input", "word counter prerender");

const notFound = await readOutput("404.html");
assertIncludes(notFound, "404 - Page not found", "404 HTML");
assertIncludes(notFound, "noindex, nofollow", "404 HTML");

const spaFallback = await readOutput("__spa-fallback.html");
assertIncludes(spaFallback, "noindex, nofollow", "SPA fallback HTML");

const sitemap = await readOutput("sitemap.xml");

for (const page of Object.values(publicSeoPages)) {
  if ("noindex" in page && page.noindex) {
    assertExcludes(sitemap, page.path, "sitemap");
  }
}

for (const tool of routableToolPages) {
  const seo = createToolSeoPage(tool);
  const path = toolPath(tool.slug);

  if (seo.noindex) {
    assertExcludes(sitemap, path, "sitemap");
  } else {
    assertIncludes(sitemap, path, "sitemap");
  }
}

console.log("SEO build verification passed.");
