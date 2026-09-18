import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { getRelatedToolPages, toolPath, type ToolPageDefinition } from "@/content/tool-pages";

export function RelatedTools({ tool }: { tool: ToolPageDefinition }) {
  const relatedTools = getRelatedToolPages(tool);
  if (relatedTools.length === 0) return null;

  return (
    <section className="border-t pt-12">
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">Related tools</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {relatedTools.map((related) => (
          <Link
            className="group rounded-xl border p-5 transition hover:border-zinc-400"
            key={related.slug}
            to={toolPath(related)}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-zinc-950">{related.name}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{related.description}</p>
              </div>
              <ArrowRight
                className="shrink-0 text-zinc-400 transition group-hover:translate-x-0.5"
                size={17}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
