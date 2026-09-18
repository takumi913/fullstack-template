import { ArrowRight } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router";
import { getLandingPageByPath } from "@/content/landing-pages";
import { getToolPageBySlug, toolPath } from "@/content/tool-pages";

export default function LandingPage() {
  const { pathname } = useLocation();
  const page = getLandingPageByPath(pathname);

  if (!page) {
    return <Navigate replace to="/404" />;
  }

  const relatedTools = page.relatedToolSlugs
    .map((slug) => getToolPageBySlug(slug))
    .filter((tool) => tool !== undefined);

  return (
    <main className="shell border-x px-6 py-12 sm:px-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-zinc-950" to="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-zinc-950" to="/resources">
              Resources
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-zinc-700">
            {page.h1}
          </li>
        </ol>
      </nav>

      <header className="mt-8 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {page.kind.replace("-", " ")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-5xl">
          {page.h1}
        </h1>
        <p className="mt-5 text-base leading-7 text-zinc-600">{page.intro}</p>
      </header>

      <div className="mt-12 max-w-3xl space-y-10">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
              {section.heading}
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600">{section.body}</p>
          </section>
        ))}
      </div>

      {relatedTools.length > 0 && (
        <section className="mt-14 border-t pt-10">
          <h2 className="text-xl font-semibold text-zinc-950">Related tools</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {relatedTools.map((tool) => (
              <Link
                className="group rounded-xl border p-5 transition hover:border-zinc-400"
                key={tool.slug}
                to={toolPath(tool)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-zinc-950">{tool.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{tool.description}</p>
                  </div>
                  <ArrowRight
                    className="shrink-0 text-zinc-400 transition group-hover:translate-x-0.5"
                    size={16}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {page.faq.length > 0 && (
        <section className="mt-14 border-t pt-10">
          <h2 className="text-xl font-semibold text-zinc-950">Frequently asked questions</h2>
          <div className="mt-5 divide-y border-y">
            {page.faq.map((item) => (
              <details className="py-5" key={item.question}>
                <summary className="cursor-pointer font-medium text-zinc-900">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
