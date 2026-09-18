import { Link, useNavigate } from "react-router-dom";
import { templateSiteConfig } from "@/config/site-config";
import { siteConfig } from "@/seo/site";
import { useAuthStore } from "@/store/authStore";

export function AppHeader() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="shell flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <span className="grid size-5 place-items-center rounded-[4px] bg-zinc-900 text-[10px] text-white">
            {siteConfig.mark}
          </span>
          {siteConfig.shortName}
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            to="/dashboard"
          >
            {templateSiteConfig.navigation.dashboard}
          </Link>
          <button
            className="rounded-md px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            onClick={() => {
              logout()
                .catch(() => {})
                .finally(() => navigate("/"));
            }}
            type="button"
          >
            {templateSiteConfig.navigation.logout}
          </button>
        </nav>
      </div>
    </header>
  );
}
