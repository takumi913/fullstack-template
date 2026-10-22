import { localizedPath, normalizeLocale } from "@/i18n/locales";
import type { ToolPageDefinition } from "@/content/tool-pages";
import { publicPageCopy } from "@/seo/ui-copy";

export function Breadcrumbs(props: { tool: ToolPageDefinition }) {
  const copy = () => publicPageCopy(props.tool.locale);

  return (
    <nav aria-label={copy().breadcrumb} class="text-sm text-muted-foreground">
      <ol class="flex flex-wrap items-center gap-2">
        <li>
          <a
            class="hover:text-foreground"
            href={localizedPath("/", normalizeLocale(props.tool.locale))}
          >
            {copy().home}
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <a
            class="hover:text-foreground"
            href={localizedPath("/tools", normalizeLocale(props.tool.locale))}
          >
            {copy().tools}
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" class="text-foreground">
          {props.tool.name}
        </li>
      </ol>
    </nav>
  );
}
