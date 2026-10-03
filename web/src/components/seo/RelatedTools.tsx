import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { getRelatedToolPages, toolPath, type ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function RelatedTools({ tool }: { tool: ToolPageDefinition }) {
  const copy = publicPageCopy(tool.locale);
  const relatedTools = getRelatedToolPages(tool);
  if (relatedTools.length === 0) return null;

  return (
    <section className="pt-4">
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {copy.relatedTools}
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {relatedTools.map((related) => (
          <Link className="spotlight-card p-6" key={related.slug} to={toolPath(related)}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">{related.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {related.description}
                </p>
              </div>
              <ArrowRight
                className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5"
                size={17}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
