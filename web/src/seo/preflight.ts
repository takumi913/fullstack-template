import type { SiteBuildEnvironment } from "../config/resolve-site-config";
import { resolveSiteConfig } from "../config/resolve-site-config";
import { landingPages } from "../content/landing-pages";
import { toolPages } from "../content/tool-pages";
import { assertProductionContentReady } from "./production-readiness";
import { assertSeoBuildSiteIdentity } from "./site-identity";
import { assertProductionSocialImage } from "./social-image";
import { assertSeoBuildSiteUrl } from "./site-url";

export function runSeoPreflight(env: SiteBuildEnvironment) {
  const strict = env["SEO_STRICT"] === "true";
  const siteUrl = assertSeoBuildSiteUrl(
    typeof env["VITE_SITE_URL"] === "string" ? env["VITE_SITE_URL"] : undefined,
    strict,
  );
  const resolvedSite = resolveSiteConfig(env);

  assertSeoBuildSiteIdentity(
    {
      name: resolvedSite.name,
      title: resolvedSite.defaultTitle,
      description: resolvedSite.defaultDescription,
    },
    strict,
  );

  assertProductionContentReady({
    strict,
    allowTemplateExamples: env["SEO_ALLOW_TEMPLATE_EXAMPLES"] === "true",
    tools: toolPages,
    landings: landingPages,
    homePrimaryToolSlug: resolvedSite.homePrimaryToolSlug,
    homePrimaryKeyword: resolvedSite.primaryKeyword,
  });

  assertProductionSocialImage({
    strict,
    allowSvgSocialImage: env["SEO_ALLOW_SVG_SOCIAL_IMAGE"] === "true",
    imagePath: resolvedSite.defaultImage,
  });

  return {
    strict,
    siteUrl,
    resolvedSite,
  } as const;
}
