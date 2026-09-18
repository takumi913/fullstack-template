import { Navigate, useLocation } from "react-router";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { LanguageSwitcher } from "@/components/seo/LanguageSwitcher";
import { ToolContentSections } from "@/components/tools/ToolContentSections";
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
      <LanguageSwitcher alternates={tool.alternates} currentPath={pathname} />

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

      <ToolContentSections tool={tool} />
    </main>
  );
}
