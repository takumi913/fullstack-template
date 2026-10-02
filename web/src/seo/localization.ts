export interface SeoAlternate {
  hreflang: string;
  path: string;
}

export interface LocalizedPageVariant {
  locale: string;
  path: string;
}

export function createHreflangAlternates(
  variants: LocalizedPageVariant[],
  xDefaultPath?: string,
): SeoAlternate[] {
  const alternates = variants.map((variant) => ({
    hreflang: variant.locale,
    path: variant.path,
  }));

  if (xDefaultPath) {
    alternates.push({ hreflang: "x-default", path: xDefaultPath });
  }

  return alternates;
}

export function isValidHreflang(value: string) {
  if (value === "x-default") return true;
  if (value.includes("_")) return false;

  try {
    new Intl.Locale(value);
    return true;
  } catch {
    return false;
  }
}

export function toOpenGraphLocale(locale: string) {
  try {
    const expanded = new Intl.Locale(locale).maximize();
    if (expanded.region) {
      return `${expanded.language}_${expanded.region}`;
    }
  } catch {
    // Fall through to a conservative separator normalization.
  }

  return locale.replace(/-/g, "_");
}

export interface ContentPublication {
  status: string;
  noindex?: boolean;
  templateExample?: boolean;
}
export function isIndexableContent(content: ContentPublication) {
  return content.status === "published" && !content.noindex && !content.templateExample;
}

// Drafts have no URL. Indexable versions must not advertise noindex translations.
export function createContentHreflangAlternates(
  current: ContentPublication,
  variants: (LocalizedPageVariant & ContentPublication)[],
) {
  const available = variants.filter(
    (variant) =>
      variant.status !== "draft" && isIndexableContent(variant) === isIndexableContent(current),
  );
  return createHreflangAlternates(
    available,
    available.find((variant) => variant.locale === "en")?.path,
  );
}
