import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSeoPreflight } from "../src/seo/preflight";
import { generatedPublicAssets, resolvePublicAssetPath } from "../src/seo/public-asset";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(scriptDir, "..", "public");
const { strict, siteUrl, resolvedSite } = runSeoPreflight(process.env);

async function assertConfiguredAssetExists(assetPath: string, label: string) {
  if (generatedPublicAssets.has(assetPath)) return;

  const filePath = resolvePublicAssetPath(publicDir, assetPath);

  try {
    await access(filePath);
  } catch {
    throw new Error(`${label} does not exist in web/public: ${assetPath}`);
  }
}

await Promise.all([
  assertConfiguredAssetExists(resolvedSite.favicon, "Configured favicon"),
  assertConfiguredAssetExists(resolvedSite.defaultImage, "Configured social image"),
]);

console.log(
  `SEO preflight passed (${strict ? "strict" : "development"}): ${resolvedSite.name} -> ${siteUrl}`,
);
