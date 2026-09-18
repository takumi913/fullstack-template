import { Link } from "react-router";
import { templateSiteConfig } from "@/config/site-config";
import { siteConfig } from "@/seo/site";

export const Footer = () => (
  <footer className="border-t bg-white">
    <div className="shell flex flex-col gap-5 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <span>{siteConfig.name}</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link className="hover:text-zinc-950" to="/tools">
          {templateSiteConfig.navigation.tools}
        </Link>
        <Link className="hover:text-zinc-950" to="/resources">
          {templateSiteConfig.navigation.resources}
        </Link>
        <Link className="hover:text-zinc-950" to="/legal/privacy-policy">
          {templateSiteConfig.navigation.privacy}
        </Link>
        <Link className="hover:text-zinc-950" to="/legal/terms">
          {templateSiteConfig.navigation.terms}
        </Link>
      </nav>
    </div>
  </footer>
);
