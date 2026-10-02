import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { siteCopies } from "@/config/site-copy";
import { useLocale } from "@/i18n/useLocale";
import { getDirectoryLandingPages } from "@/content/landing-pages";
import { publicPageCopy } from "@/seo/ui-copy";
import { getPublicSeoPages } from "@/seo/pages";

export default function ResourcesPage() {
  const locale = useLocale();
  const publicSeoPages = getPublicSeoPages(locale);
  const copy = siteCopies[locale].hubs.resources;
  return (
    <main className="shell border-x px-6 py-12 sm:px-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
          {publicSeoPages.resources.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">{copy.description}</p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        {getDirectoryLandingPages(locale).map((page) => (
          <Link
            className="group rounded-xl border p-5 transition hover:border-zinc-400"
            key={page.path}
            to={page.path}
          >
            <p className="text-xs text-zinc-500">{publicPageCopy(locale).kinds[page.kind]}</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-medium text-zinc-950">{page.h1}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{page.description}</p>
              </div>
              <ArrowRight
                className="mt-1 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5"
                size={16}
              />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
