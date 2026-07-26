import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t bg-white">
    <div className="shell flex flex-col gap-3 py-7 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
      <span>Fullstack Template</span>
      <div className="flex gap-5">
        <Link className="hover:text-zinc-950" to="/legal/privacy-policy">
          隐私政策
        </Link>
        <Link className="hover:text-zinc-950" to="/legal/terms">
          服务条款
        </Link>
      </div>
    </div>
  </footer>
);
