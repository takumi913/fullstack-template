import type { ToolPageDefinition } from "@/content/tool-pages";
import { RelatedResources } from "@/components/seo/RelatedResources";
import { RelatedTools } from "@/components/seo/RelatedTools";

function FeaturesAndHowTo({ tool }: { tool: ToolPageDefinition }) {
  return (
    <>
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
    </>
  );
}

function FaqContent({ tool }: { tool: ToolPageDefinition }) {
  if (tool.faq.length === 0) return null;

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y border-y">
        {tool.faq.map((item) => (
          <details className="group py-5" key={item.question}>
            <summary className="cursor-pointer list-none font-medium text-zinc-900">
              {item.question}
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}

function RelatedContent({ tool }: { tool: ToolPageDefinition }) {
  return (
    <div className="space-y-14">
      <RelatedResources tool={tool} />
      <RelatedTools tool={tool} />
    </div>
  );
}

export function ToolContentSections({
  tool,
  surface = "page",
}: {
  tool: ToolPageDefinition;
  surface?: "page" | "home";
}) {
  if (surface === "home") {
    return (
      <>
        <section className="shell grid gap-10 border-x border-t px-6 py-12 sm:px-12 lg:grid-cols-2">
          <FeaturesAndHowTo tool={tool} />
        </section>

        {tool.faq.length > 0 ? (
          <section className="shell border-x border-t px-6 py-12 sm:px-12">
            <FaqContent tool={tool} />
          </section>
        ) : null}

        <section className="shell border-x border-t px-6 py-12 sm:px-12">
          <RelatedContent tool={tool} />
        </section>
      </>
    );
  }

  return (
    <>
      <section className="mt-14 grid gap-10 border-t pt-12 lg:grid-cols-2">
        <FeaturesAndHowTo tool={tool} />
      </section>

      {tool.faq.length > 0 ? (
        <section className="mt-14 border-t pt-12">
          <FaqContent tool={tool} />
        </section>
      ) : null}

      <div className="mt-14">
        <RelatedContent tool={tool} />
      </div>
    </>
  );
}
