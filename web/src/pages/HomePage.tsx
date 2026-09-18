import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router";
import { templateSiteConfig } from "@/config/site-config";
import { directoryToolPages, toolPath } from "@/content/tool-pages";
import { publicSeoPages } from "@/seo/pages";

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="shell border-x px-6 py-24 sm:px-12 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-950 sm:text-7xl">
            {publicSeoPages.home.h1}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600">
            {templateSiteConfig.home.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="button-primary">
              {templateSiteConfig.home.primaryCta} <ArrowRight size={15} />
            </Link>
            <Link to="/login" className="button-secondary">
              {templateSiteConfig.home.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-10 sm:px-12">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950">
          {templateSiteConfig.home.capabilitiesTitle}
        </h2>
      </section>

      <section className="shell border-x border-t">
        <div className="grid md:grid-cols-2">
          {templateSiteConfig.home.capabilities.map(([title, description], index) => (
            <div
              key={title}
              className={`min-h-44 p-7 sm:p-9 ${index % 2 === 0 ? "md:border-r" : ""} ${index > 1 ? "border-t" : index === 1 ? "border-t md:border-t-0" : ""}`}
            >
              <div className="mb-5 grid size-7 place-items-center rounded-md border bg-zinc-50 text-zinc-600">
                <Check size={14} />
              </div>
              <h3 className="text-base font-medium text-zinc-950">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-16 sm:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            {templateSiteConfig.home.examplesEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-950">
            {templateSiteConfig.home.examplesTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {templateSiteConfig.home.examplesDescription}
          </p>
          <Link
            className="mt-4 inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-950"
            to="/tools"
          >
            {templateSiteConfig.home.examplesLink} →
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {directoryToolPages.map((tool) => (
            <Link
              className="group rounded-xl border p-5 transition hover:border-zinc-400"
              key={tool.slug}
              to={toolPath(tool)}
            >
              <p className="text-xs text-zinc-500">{tool.category}</p>
              <h3 className="mt-2 font-medium text-zinc-950">{tool.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-700">
                {templateSiteConfig.home.exampleCardCta} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shell border-x border-t px-6 py-20 sm:px-12">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-md text-3xl font-semibold tracking-[-0.035em]">
            {templateSiteConfig.home.closingTitle}
          </h2>
          <Link to="/register" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
            {templateSiteConfig.home.closingCta} →
          </Link>
        </div>
      </section>
    </div>
  );
}
