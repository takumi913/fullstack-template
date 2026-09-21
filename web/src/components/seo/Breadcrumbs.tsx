import { Link } from "react-router";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function Breadcrumbs({ tool }: { tool: ToolPageDefinition }) {
  const copy = publicPageCopy(tool.locale);

  return (
    <nav aria-label={copy.breadcrumb} className="text-sm text-zinc-500">
      <ol className="flex items-center gap-2">
        <li>
          <Link className="hover:text-zinc-950" to="/">
            {copy.home}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-zinc-950" to="/tools">
            {copy.tools}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-zinc-700">
          {tool.name}
        </li>
      </ol>
    </nav>
  );
}
