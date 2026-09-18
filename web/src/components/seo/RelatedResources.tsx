import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getLandingPagesForTool } from "@/content/landing-pages";
import type { ToolPageDefinition } from "@/content/tool-pages";

export function RelatedResources({ tool }: { tool: ToolPageDefinition }) {
  const resources = getLandingPagesForTool(tool.slug);
  if (resources.length === 0) return null;

  return (
    <section className="border-t pt-12">
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
        Related resources
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {resources.map((resource) => (
          <Link
            className="group rounded-xl border p-5 transition hover:border-zinc-400"
            key={resource.path}
            to={resource.path}
          >
            <p className="text-xs capitalize text-zinc-500">
              {resource.kind.replace("-", " ")}
            </p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-zinc-950">{resource.h1}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {resource.description}
                </p>
              </div>
              <ArrowRight
                className="mt-1 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5"
                size={16}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
