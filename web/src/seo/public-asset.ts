export const generatedPublicAssets = new Set(["/favicon.svg", "/og-image.svg"]);

export function normalizePublicAssetPath(assetPath: string) {
  const normalized = assetPath.trim();

  if (!normalized.startsWith("/")) {
    throw new Error(`Public asset path must begin with '/': ${assetPath}`);
  }

  if (normalized.includes("?") || normalized.includes("#")) {
    throw new Error(`Public asset path must not include query/hash: ${assetPath}`);
  }

  const segments = normalized.split("/").filter(Boolean);

  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Public asset path must stay inside web/public: ${assetPath}`);
  }

  return segments.join("/");
}
