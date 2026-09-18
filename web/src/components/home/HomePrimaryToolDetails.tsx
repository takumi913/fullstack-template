import type { ToolPageDefinition } from "@/content/tool-pages";
import { RelatedResources } from "@/components/seo/RelatedResources";
import { RelatedTools } from "@/components/seo/RelatedTools";

export function HomePrimaryToolDetails({ tool }: { tool: ToolPageDefinition }) {
  return (
    <>
      <section className="shell grid gap-10 border-x border-t px-6 py-12 sm:px-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
            What this tool does
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-600">
            {tool.features.map((feature) => (
              <li className="flex gap-3" key={feature}>
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-400"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">How to use it</h2>
          <ol className="mt-5 space-y-4 text-sm leading-6 text-zinc-600">
            {tool.howToSteps.map((step, index) => (
              <li className="flex gap-3" key={step}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full border text-xs text-zinc-600">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {tool.faq.length > 0 ? (
        <section className="shell border-x border-t px-6 py-12 sm:px-12">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y border-y">
            {tool.faq.map((item) => (
              <details className="py-5" key={item.question}>
                <summary className="cursor-pointer font-medium text-zinc-900">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="shell border-x border-t px-6 py-12 sm:px-12">
        <div className="space-y-14">
          <RelatedResources tool={tool} />
          <RelatedTools tool={tool} />
        </div>
      </section>
    </>
  );
}
