import { unlocalizedPath } from "../i18n/locales";
const privateAppExactPaths = new Set(["/dashboard"]);
const privateAppPrefixes = ["/settings/", "/tenant/"] as const;
const authPaths = new Set(["/login", "/register"]);

function isToolRuntimePath(pathname: string) {
  if (/^\/tools\/[^/]+$/.test(pathname)) return true;
  return /^\/[A-Za-z0-9-]+\/tools\/[^/]+$/.test(pathname);
}

export function shouldHydrateDocument(
  pathname: string,
  matchCount: number,
  homeHasInteractiveTool = false,
  hasInteractiveShell = false,
) {
  // Theme controls and mobile navigation need the runtime even on prerendered pages.
  if (hasInteractiveShell) return true;
  // React Router's SPA fallback renders only the root route at build time.
  // It must always keep the client runtime so non-prerendered auth/app URLs can hydrate.
  if (matchCount <= 1) return true;

  pathname = unlocalizedPath(pathname);
  if (pathname === "/" && homeHasInteractiveTool) return true;
  if (authPaths.has(pathname)) return true;
  if (privateAppExactPaths.has(pathname)) return true;
  if (privateAppPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;

  return isToolRuntimePath(pathname);
}
