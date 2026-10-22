import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { publicPrerenderPaths } from "../src/seo/pages";
import { toolPrerenderPaths } from "../src/content/tool-pages";
import { landingPrerenderPaths } from "../src/content/landing-pages";
import { runSeoPreflight } from "../src/seo/preflight";

const output = join(import.meta.dirname, "..", "dist");
const { siteUrl } = runSeoPreflight(process.env);
const { handleRequest } = (await import(
  pathToFileURL(join(output, "server", "server.js")).href
)) as {
  handleRequest: (request: Request) => Promise<Response>;
};
const paths = [
  ...new Set(["/404", ...publicPrerenderPaths, ...toolPrerenderPaths, ...landingPrerenderPaths]),
];
for (const path of [...paths, "/__spa-fallback"]) {
  const response = await handleRequest(new Request(new URL(path, siteUrl)));
  if (!response.ok && !(path === "/404" && response.status === 404)) {
    throw new Error(`Prerender failed: ${path} returned ${response.status}`);
  }
  const target =
    path === "/__spa-fallback"
      ? "__spa-fallback.html"
      : join(...path.split("/").filter(Boolean), "index.html");
  const file = join(output, "client", target);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, await response.text());
}
console.log(`Prerendered ${paths.length} public pages and the private app shell.`);
