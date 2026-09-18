import { Link } from "react-router";
import { templateSiteConfig } from "@/config/site-config";
import { siteConfig } from "@/seo/site";

export function PublicHeader() {
  return (
    <header className="border-b bg-white">
      <div className="shell flex min-h-14 items-center justify-between gap-4 py-2">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-[-0.01em]"
        >
          <span className="grid size-5 place-items-center rounded-[4px] bg-zinc-900 text-[10px] text-white">
            {siteConfig.mark}
          </span>
          {siteConfig.shortName}
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center justify-end gap-1">
          <Link
            className="rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to="/tools"
          >
            {templateSiteConfig.navigation.tools}
          </Link>
          <Link
            className="rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to="/resources"
          >
            {templateSiteConfig.navigation.resources}
          </Link>
          <Link
            className="rounded-md px-2.5 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to="/login"
          >
            {templateSiteConfig.navigation.login}
          </Link>
          <Link className="button-primary min-h-9 px-3" to="/register">
            {templateSiteConfig.navigation.register}
          </Link>
        </nav>
      </div>
    </header>
  );
}
