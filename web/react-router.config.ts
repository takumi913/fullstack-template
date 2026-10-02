import { publicPrerenderPaths } from "./src/seo/pages";
import type { Config } from "@react-router/dev/config";
import { landingPrerenderPaths } from "./src/content/landing-pages";
import { toolPrerenderPaths } from "./src/content/tool-pages";

export default {
  appDirectory: "src",
  buildDirectory: "dist",
  ssr: false,
  future: {
    v8_viteEnvironmentApi: true,
  },
  prerender: ["/404", ...publicPrerenderPaths, ...toolPrerenderPaths, ...landingPrerenderPaths],
} satisfies Config;
