import type { Config } from "@react-router/dev/config";
import { toolPrerenderPaths } from "./src/content/tool-pages";

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: false,
  prerender: ["/", "/legal/privacy-policy", "/legal/terms", ...toolPrerenderPaths],
} satisfies Config;
