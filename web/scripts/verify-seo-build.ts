import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveHomepageTool } from "../src/content/homepage-tool";
import {
  getDirectoryLandingPages,
  getLandingPagesForTool,
  routableLandingPages,
} from "../src/content/landing-pages";
import { routableToolPages, toolPath } from "../src/content/tool-pages";
import { createLandingSeoPage } from "../src/seo/landing-page";
import { allPublicSeoPages, getPublicSeoPages, publicSeoPages } from "../src/seo/pages";
import { createToolSeoPage } from "../src/seo/tool-page";
import { publicPageCopy } from "../src/seo/ui-copy";
import { legalPages } from "../src/content/legal-pages";
import { localizedPath, supportedLocales } from "../src/i18n/locales";
import { commonTranslations } from "../src/i18n/common";
import { siteConfig } from "../src/seo/site";
import { toolsmithCopy } from "../src/config/toolsmith-copy";

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
const homePrimaryTool = resolveHomepageTool(siteConfig.homePrimaryToolSlug);
if (homePrimaryTool) {
  assertHydratedHtml(home, "home primary tool HTML");
  assertIncludes(home, homePrimaryTool.name, "home primary tool name");
  if (homePrimaryTool.componentKey === "ai-text") {
    const copy = toolsmithCopy("en");
    assertIncludes(home, copy.h1b, "home design headline");
    assertIncludes(home, copy.heroSub, "home design trust note");
    for (const mode of ["Rewrite", "Summarize", "Translate"]) {
      assertIncludes(home, mode, "home design mode tabs");
    }
  } else if (homePrimaryTool.features[0]) {
    assertIncludes(home, homePrimaryTool.features[0], "home primary tool feature");
  }
} else {
  assertHydratedHtml(home, "home HTML");
}

const toolsHub = await readOutput("tools", "index.html");
assertIncludes(toolsHub, publicSeoPages.tools.title, "tools hub HTML");
assertIncludes(toolsHub, "noindex, follow", "tools hub HTML");
assertIncludes(toolsHub, 'lang="en"', "tools hub document language");
assertPublicHtmlDoesNotLoadPrivateApp(toolsHub, "tools hub HTML");
assertHydratedHtml(toolsHub, "tools hub HTML");

const resourcesHub = await readOutput("resources", "index.html");
assertIncludes(resourcesHub, publicSeoPages.resources.title, "resources hub HTML");
assertIncludes(resourcesHub, "noindex, follow", "resources hub HTML");
assertPublicHtmlDoesNotLoadPrivateApp(resourcesHub, "resources hub HTML");
assertHydratedHtml(resourcesHub, "resources hub HTML");

for (const page of allPublicSeoPages) {
  if (!("noindex" in page) || !page.noindex) continue;
  const html = await readOutput(...htmlOutputParts(page.path));
  assertIncludes(html, "noindex, follow", `${page.path} public noindex HTML`);
  assertHydratedHtml(html, `${page.path} public noindex HTML`);
}

for (const locale of supportedLocales) {
  const pages = getPublicSeoPages(locale);
  const copy = commonTranslations[locale];
  const resources = await readOutput(...htmlOutputParts(localizedPath("/resources", locale)));
  for (const landing of getDirectoryLandingPages(locale)) {
    assertIncludes(resources, `href="${landing.path}"`, `${locale} resources -> ${landing.path}`);
  }
  for (const page of Object.values(pages)) {
    const html = await readOutput(...htmlOutputParts(page.path));
    assertIncludes(html, `lang="${locale}"`, `${page.path} document language`);
    assertIncludes(html, `<title>${page.title}</title>`, `${page.path} title`);
    assertIncludes(html, `href="${siteConfig.url}${page.path}"`, `${page.path} canonical`);
    assertIncludes(html, copy.navigation.privacy, `${page.path} privacy navigation`);
    assertIncludes(html, copy.navigation.terms, `${page.path} terms navigation`);
    for (const alternate of page.alternates || []) {
      assertIncludes(
        html,
        `href="${siteConfig.url}${alternate.path}"`,
        `${page.path} hreflang URL`,
      );
      if (alternate.hreflang !== "x-default") {
        assertIncludes(html, `href="${alternate.path}"`, `${page.path} visible language link`);
      }
    }
    assertPublicHtmlDoesNotLoadPrivateApp(html, page.path);
    if (page.noindex) assertIncludes(html, "noindex, follow", page.path);
    const primary = resolveHomepageTool(siteConfig.homePrimaryToolSlug, undefined, locale);
    if (page.path === pages.home.path && primary) {
      assertHydratedHtml(html, page.path);
      assertIncludes(html, primary.h1, `${page.path} localized primary tool`);
    } else {
      assertHydratedHtml(html, page.path);
    }
    if (locale === "en") {
      // Native language names in the switcher are intentional; English page copy is not Chinese.
      const withoutLanguageName = html.replaceAll("简体中文", "");
      assertExcludes(withoutLanguageName, "隐私政策", `${page.path} English navigation`);
      assertExcludes(withoutLanguageName, "服务条款", `${page.path} English navigation`);
    }
  }
  for (const kind of ["privacy", "terms"] as const) {
    const html = await readOutput(...htmlOutputParts(pages[kind].path));
    for (const section of legalPages[locale][kind].sections) {
      assertIncludes(html, section.heading, `${locale} ${kind} section`);
    }
  }
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

  const toolLanguageVersions = (tool.alternates || []).filter(
    (alternate) => alternate.hreflang !== "x-default",
  );
  if (toolLanguageVersions.length > 1) {
    const copy = publicPageCopy(tool.locale);
    assertIncludes(html, `aria-label="${copy.languageVersions}"`, `${tool.slug} language switcher`);
  }

  for (const alternate of tool.alternates || []) {
    assertMatches(
      html,
      new RegExp(`hrefLang="${alternate.hreflang}"`, "i"),
      `${tool.slug} hreflang`,
    );
    assertIncludes(html, `href="${siteConfig.url}${alternate.path}"`, `${tool.slug} alternate URL`);

    if (alternate.hreflang !== "x-default" && alternate.path !== toolPath(tool)) {
      assertIncludes(html, `href="${alternate.path}"`, `${tool.slug} visible language link`);
    }
  }
}

const jsonFormatterHtml = await readOutput("tools", "json-formatter", "index.html");
assertIncludes(jsonFormatterHtml, "JSON input", "json formatter prerender");

const wordCounterHtml = await readOutput("tools", "word-counter", "index.html");
assertIncludes(wordCounterHtml, "word-counter-input", "word counter prerender");

const chineseJsonFormatter = await readOutput("zh-cn", "tools", "json-formatter", "index.html");
assertIncludes(chineseJsonFormatter, "JSON 输入", "Chinese formatter interaction");
for (const heading of ["whatThisToolDoes", "howToUse", "faq", "relatedResources"] as const) {
  assertIncludes(chineseJsonFormatter, commonTranslations["zh-CN"][heading], `Chinese ${heading}`);
}
const chineseGuide = await readOutput("zh-cn", "guides", "json-syntax", "index.html");
assertIncludes(chineseGuide, 'lang="zh-CN"', "Chinese guide language");
assertIncludes(chineseGuide, "JSON 语法指南", "Chinese guide content");
assertIncludes(chineseGuide, "首页", "Chinese guide breadcrumb");

const notFound = await readOutput("404.html");
assertIncludes(notFound, "404 - Page not found", "404 HTML");
assertIncludes(notFound, "noindex, nofollow", "404 HTML");
assertHydratedHtml(notFound, "404 HTML");
await assertOutputMissing("404", "index.html");

const spaFallback = await readOutput("__spa-fallback.html");
assertIncludes(spaFallback, "noindex, nofollow", "SPA fallback HTML");
assertHydratedHtml(spaFallback, "SPA fallback HTML");

const redirects = await readOutput("_redirects");
assertExcludes(redirects, "/404.html                404", "Cloudflare redirects");
for (const rule of [
  "/tools/                 /tools                  301",
  "/tools/:slug/           /tools/:slug            301",
  "/resources/             /resources              301",
  "/use-cases/:slug/       /use-cases/:slug        301",
  "/compare/:slug/         /compare/:slug          301",
  "/guides/:slug/          /guides/:slug           301",
]) {
  assertIncludes(redirects, rule, "Cloudflare canonical redirects");
}

for (const locale of supportedLocales) {
  for (const path of [
    "/login",
    "/register",
    "/dashboard",
    "/settings/profile",
    "/tenant/members",
  ]) {
    const localized = localizedPath(path, locale);
    const rule = redirects
      .split("\n")
      .find(
        (line) =>
          line.trim().split(/\s+/)[0] === localized ||
          line.trim().split(/\s+/)[0] === localized.replace(/\/[^/]+$/, "/*"),
      );
    if (!rule || !/\/__spa-fallback\.html\s+200$/.test(rule))
      throw new Error(`Missing private fallback for ${localized}`);
  }
}
assertIncludes(redirects, "/zh-cn/ /zh-cn 301", "Chinese home canonical redirect");
assertExcludes(redirects, "\n/* ", "no catch-all fallback");

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
  assertHydratedHtml(html, `${page.slug} landing HTML`);
  assertIncludes(html, page.title, `${page.slug} landing HTML`);
  assertIncludes(html, page.h1, `${page.slug} landing HTML`);
  assertIncludes(html, 'rel="canonical"', `${page.slug} landing HTML`);
  assertIncludes(html, "BreadcrumbList", `${page.slug} landing HTML`);
  assertIncludes(html, "WebPage", `${page.slug} landing HTML`);

  if (seo.noindex) {
    assertIncludes(html, "noindex, follow", `${page.slug} landing HTML`);
  }

  const landingLanguageVersions = (page.alternates || []).filter(
    (alternate) => alternate.hreflang !== "x-default",
  );
  if (landingLanguageVersions.length > 1) {
    const copy = publicPageCopy(page.locale);
    assertIncludes(html, `aria-label="${copy.languageVersions}"`, `${page.slug} language switcher`);
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

    if (alternate.hreflang !== "x-default" && alternate.path !== page.path) {
      assertIncludes(html, `href="${alternate.path}"`, `${page.slug} visible language link`);
    }
  }
}

const sitemap = await readOutput("sitemap.xml");
assertIncludes(sitemap, `<loc>${siteConfig.url}/</loc>`, "sitemap");

for (const page of allPublicSeoPages) {
  if ("noindex" in page && page.noindex) {
    assertExcludes(sitemap, `<loc>${siteConfig.url}${page.path}</loc>`, "sitemap");
  }
}

for (const tool of routableToolPages) {
  const seo = createToolSeoPage(tool);
  const path = toolPath(tool);

  if (seo.noindex) {
    assertExcludes(sitemap, `<loc>${siteConfig.url}${path}</loc>`, "sitemap");
  } else {
    assertIncludes(sitemap, `<loc>${siteConfig.url}${path}</loc>`, "sitemap");
  }
}

for (const page of routableLandingPages) {
  const seo = createLandingSeoPage(page);

  if (seo.noindex) {
    assertExcludes(sitemap, `<loc>${siteConfig.url}${page.path}</loc>`, "sitemap");
  } else {
    assertIncludes(sitemap, `<loc>${siteConfig.url}${page.path}</loc>`, "sitemap");
  }
}

console.log("SEO build verification passed.");
