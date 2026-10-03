import { localizedPath, normalizeLocale } from "@/i18n/locales";
import { Link } from "react-router";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function Breadcrumbs({ tool }: { tool: ToolPageDefinition }) {
  const copy = publicPageCopy(tool.locale);

  return (
    <nav aria-label={copy.breadcrumb} className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            className="hover:text-foreground"
            to={localizedPath("/", normalizeLocale(tool.locale))}
          >
            {copy.home}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            className="hover:text-foreground"
            to={localizedPath("/tools", normalizeLocale(tool.locale))}
          >
            {copy.tools}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-foreground">
          {tool.name}
        </li>
      </ol>
    </nav>
  );
}
