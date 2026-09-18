export interface SocialImageValidationOptions {
  strict: boolean;
  allowSvgSocialImage?: boolean;
  imagePath: string;
}

const rasterExtensions = [".png", ".jpg", ".jpeg"] as const;

export function assertProductionSocialImage({
  strict,
  allowSvgSocialImage = false,
  imagePath,
}: SocialImageValidationOptions) {
  if (!strict) return;

  const normalized = imagePath.trim().toLocaleLowerCase();

  if (!normalized.startsWith("/")) {
    throw new Error(
      "Production social image must be a local public asset path beginning with '/'.",
    );
  }

  if (normalized.endsWith(".svg")) {
    if (allowSvgSocialImage) return;
    throw new Error(
      "SEO_STRICT=true requires a raster social image (.png/.jpg/.jpeg). SVG Open Graph images are not reliably supported by social crawlers. Use SEO_ALLOW_SVG_SOCIAL_IMAGE=true only for template CI/testing.",
    );
  }

  if (!rasterExtensions.some((extension) => normalized.endsWith(extension))) {
    throw new Error(
      "SEO_STRICT=true requires VITE_SITE_IMAGE/site-config.ts to use .png, .jpg, or .jpeg.",
    );
  }
}
