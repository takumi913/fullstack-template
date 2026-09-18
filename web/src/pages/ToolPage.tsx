import { Navigate, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { getToolPageByPath } from "@/content/tool-pages";
import { ToolRuntime } from "@/tools/registry";

export default function ToolPage() {
  const { pathname } = useLocation();
  const tool = getToolPageByPath(pathname);

  if (!tool) {
    return <Navigate replace to="/404" />;
  }

  return (
    <main className="shell border-x px-6 py-10 sm:px-12 sm:py-14">
      <Breadcrumbs tool={tool} />

      <header className="mt-8 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {tool.category}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
          {tool.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">{tool.intro}</p>
      </header>

      <section className="mt-10" aria-label={tool.name}>
        <ToolRuntime page={tool} />
      </section>

      <section className="mt-14 grid gap-10 border-t pt-12 lg:grid-cols-2">
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

      {tool.faq.length > 0 && (
        <section className="mt-14 border-t pt-12">
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
        </section>
      )}

      <div className="mt-14">
        <RelatedTools tool={tool} />
      </div>
    </main>
  );
}
