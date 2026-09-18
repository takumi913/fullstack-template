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
