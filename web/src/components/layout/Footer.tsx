import { Link } from "react-router-dom";
import { directoryToolPages, toolPath } from "@/content/tool-pages";

export const Footer = () => (
  <footer className="border-t bg-white">
    <div className="shell flex flex-col gap-5 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Fullstack Template</span>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link className="hover:text-zinc-950" to="/tools">
          Tools
        </Link>
        {directoryToolPages.map((tool) => (
          <Link className="hover:text-zinc-950" key={tool.slug} to={toolPath(tool)}>
            {tool.name}
          </Link>
        ))}
        <Link className="hover:text-zinc-950" to="/legal/privacy-policy">
          隐私政策
        </Link>
        <Link className="hover:text-zinc-950" to="/legal/terms">
          服务条款
        </Link>
      </nav>
    </div>
  </footer>
);
