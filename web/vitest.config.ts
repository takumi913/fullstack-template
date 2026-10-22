import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [solid()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "src/**/*.ssr.test.tsx"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          exclude: ["src/**/*.ssr.test.tsx"],
        },
      },
    ],
  },
});
