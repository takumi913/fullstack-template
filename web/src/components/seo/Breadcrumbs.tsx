import { Link } from "react-router-dom";
import type { ToolPageDefinition } from "@/content/tool-pages";

export function Breadcrumbs({ tool }: { tool: ToolPageDefinition }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
      <ol className="flex items-center gap-2">
        <li>
          <Link className="hover:text-zinc-950" to="/">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link className="hover:text-zinc-950" to="/tools">
            {tool.locale === "ja" ? "ツール" : "Tools"}
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
