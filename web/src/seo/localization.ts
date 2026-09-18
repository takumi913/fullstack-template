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


export function toOpenGraphLocale(locale: string) {
  try {
    const expanded = new Intl.Locale(locale).maximize();
    if (expanded.region) {
      return `${expanded.language}_${expanded.region}`;
    }
  } catch {
    // Fall through to a conservative separator normalization.
  }

  return locale.replaceAll("-", "_");
}
