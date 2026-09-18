import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { minify: "esbuild", target: "es2020" },
  server: { proxy: { "/api": { target: "http://localhost:1323", changeOrigin: true } } },
});
