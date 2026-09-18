import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { directoryToolPages, toolPath } from "@/content/tool-pages";
import { publicSeoPages } from "@/seo/pages";

export default function ToolsPage() {
  return (
    <main className="shell border-x px-6 py-12 sm:px-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Tools</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
          {publicSeoPages.tools.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Browse the public tool pages included with the template. Example tools stay noindex until
          you replace them with real product functionality and publish them.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2">
        {directoryToolPages.map((tool) => (
          <Link
            className="group rounded-xl border p-5 transition hover:border-zinc-400"
            key={tool.slug}
            to={toolPath(tool)}
          >
            <p className="text-xs text-zinc-500">{tool.category}</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-medium text-zinc-950">{tool.name}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{tool.description}</p>
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
