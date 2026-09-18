import { resolve, sep } from "node:path";

export const generatedPublicAssets = new Set(["/favicon.svg", "/og-image.svg"]);

export function resolvePublicAssetPath(publicDir: string, assetPath: string) {
  const normalized = assetPath.trim();

  if (!normalized.startsWith("/")) {
    throw new Error(`Public asset path must begin with '/': ${assetPath}`);
  }

  if (normalized.includes("?") || normalized.includes("#")) {
    throw new Error(`Public asset path must not include query/hash: ${assetPath}`);
  }

  const relative = normalized.replace(/^\/+/, "");
  const root = resolve(publicDir);
  const fullPath = resolve(root, relative);

  if (fullPath !== root && !fullPath.startsWith(root + sep)) {
    throw new Error(`Public asset path escapes web/public: ${assetPath}`);
  }

  return fullPath;
}
