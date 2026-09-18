import { Link } from "react-router";
import type { SeoAlternate } from "@/seo/localization";

function languageLabel(hreflang: string) {
  return hreflang.toUpperCase();
}

export function LanguageSwitcher({
  alternates,
  currentPath,
}: {
  alternates?: SeoAlternate[];
  currentPath: string;
}) {
  const versions = (alternates || []).filter((alternate) => alternate.hreflang !== "x-default");

  if (versions.length < 2) return null;

  return (
    <nav aria-label="Language versions" className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-zinc-500">Language</span>
      {versions.map((alternate) =>
        alternate.path === currentPath ? (
          <span
            aria-current="page"
            className="rounded-md bg-zinc-900 px-2 py-1 font-medium text-white"
            key={alternate.hreflang}
          >
            {languageLabel(alternate.hreflang)}
          </span>
        ) : (
          <Link
            className="rounded-md border px-2 py-1 font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-950"
            key={alternate.hreflang}
            lang={alternate.hreflang}
            to={alternate.path}
          >
            {languageLabel(alternate.hreflang)}
          </Link>
        ),
      )}
    </nav>
  );
}
