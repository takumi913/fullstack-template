import { Show, For } from "solid-js";
import { ArrowRight } from "@lucide/solid";
import { getRelatedToolPages, toolPath, type ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function RelatedTools(props: { tool: ToolPageDefinition }) {
  const copy = () => publicPageCopy(props.tool.locale);
  const relatedTools = () => getRelatedToolPages(props.tool);

  return (
    <Show when={relatedTools().length > 0}>
      <section class="pt-4">
        <h2 class="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          {copy().relatedTools}
        </h2>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <For each={relatedTools()}>
            {(related) => (
              <a class="spotlight-card p-6" href={toolPath(related)}>
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <h3 class="font-medium text-foreground">{related.name}</h3>
                    <p class="mt-1 text-sm leading-6 text-muted-foreground">
                      {related.description}
                    </p>
                  </div>
                  <ArrowRight
                    class="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5"
                    size={17}
                  />
                </div>
              </a>
            )}
          </For>
        </div>
      </section>
    </Show>
  );
}
