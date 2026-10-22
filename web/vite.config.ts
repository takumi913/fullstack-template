import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid({ start: { app: "src/root.tsx", renderMode: "async" }, ssr: true }),
  ],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: { minify: "esbuild", target: "es2020" },
  server: { proxy: { "/api": { target: "http://localhost:1323", changeOrigin: true } } },
});
