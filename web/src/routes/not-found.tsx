import { Link } from "react-router-dom";
import { privatePageMeta } from "@/seo/page";

export const meta = () => [{ title: "404 - Page not found" }, ...privatePageMeta];

export default function NotFoundRoute() {
  return (
    <main className="shell grid min-h-[60vh] place-items-center border-x px-6 py-20 text-center">
      <div>
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-zinc-950">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-zinc-500">The requested page does not exist.</p>
        <Link className="button-primary mt-6 inline-flex" to="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
