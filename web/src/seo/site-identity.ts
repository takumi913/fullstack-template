import { scaffoldSentinels } from "../config/scaffold-sentinels";

export interface SeoSiteIdentityInput {
  name?: string;
  title?: string;
  description?: string;
}

function normalized(value: string | undefined) {
  return value?.trim() || "";
}

export function assertSeoBuildSiteIdentity(input: SeoSiteIdentityInput, strict: boolean) {
  if (!strict) return;

  const name = normalized(input.name);
  const title = normalized(input.title);
  const description = normalized(input.description);

  if (!name || name === scaffoldSentinels.name) {
    throw new Error(
      "SEO_STRICT=true requires the resolved site name to be customized from the original scaffold default",
    );
  }

  if (!title || title === scaffoldSentinels.title) {
    throw new Error(
      "SEO_STRICT=true requires the resolved site title to be customized from the original scaffold default",
    );
  }

  if (!description || description === scaffoldSentinels.description) {
    throw new Error(
      "SEO_STRICT=true requires the resolved site description to be customized from the original scaffold default",
    );
  }
}
