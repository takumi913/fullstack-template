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
  prerender: [
    "/",
    "/404",
    "/tools",
    "/resources",
    "/legal/privacy-policy",
    "/legal/terms",
    ...toolPrerenderPaths,
    ...landingPrerenderPaths,
  ],
} satisfies Config;
