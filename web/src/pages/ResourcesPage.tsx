import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { directoryLandingPages } from "@/content/landing-pages";
import { publicSeoPages } from "@/seo/pages";

const kindLabel = {
  "use-case": "Use case",
  comparison: "Comparison",
  guide: "Guide",
} as const;

export default function ResourcesPage() {
  return (
    <main className="shell border-x px-6 py-12 sm:px-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Resources</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
          {publicSeoPages.resources.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Use cases, comparisons, and guides live here so informational pages remain connected to
          the tools they support.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        {directoryLandingPages.map((page) => (
          <Link
            className="group rounded-xl border p-5 transition hover:border-zinc-400"
            key={page.path}
            to={page.path}
          >
            <p className="text-xs text-zinc-500">{kindLabel[page.kind]}</p>
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
