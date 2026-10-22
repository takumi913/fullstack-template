import { Show, For } from "solid-js";
import { ArrowRight } from "@lucide/solid";
import { getLandingPagesForTool } from "@/content/landing-pages";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function RelatedResources(props: { tool: ToolPageDefinition }) {
  const copy = () => publicPageCopy(props.tool.locale);
  const resources = () => getLandingPagesForTool(props.tool.slug);

  return (
    <Show when={resources().length > 0}>
      <section class="pt-4">
        <h2 class="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          {copy().relatedResources}
        </h2>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <For each={resources()}>
            {(resource) => (
              <a class="spotlight-card p-6" href={resource.path}>
                <p class="text-xs capitalize text-muted-foreground">
                  {copy().kinds[resource.kind]}
                </p>
                <div class="mt-2 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-medium text-foreground">{resource.h1}</h3>
                    <p class="mt-1 text-sm leading-6 text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                  <ArrowRight
                    class="mt-1 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5"
                    size={16}
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
