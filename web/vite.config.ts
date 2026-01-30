import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { sitemapPlugin } from "./plugins/sitemap";
import { llmsPlugin } from "./plugins/llms";

// 网站域名配置（用于生成 sitemap）
const SITE_HOSTNAME = "https://mdzz.uk";

// Sitemap 路由配置
const sitemapRoutes = [
  // 首页
  { path: "/", changefreq: "daily" as const, priority: 1.0 },
  // 核心工具页
  { path: "/remove-watermark", changefreq: "weekly" as const, priority: 0.9 },
  { path: "/translate-image", changefreq: "weekly" as const, priority: 0.9 },
  // SEO Landing Pages
  { path: "/manga-translator", changefreq: "weekly" as const, priority: 0.8 },
  { path: "/comic-translator", changefreq: "weekly" as const, priority: 0.8 },
  // 信息页面
  { path: "/pricing", changefreq: "monthly" as const, priority: 0.6 },
  { path: "/faq", changefreq: "monthly" as const, priority: 0.5 },
  // 法律页面
  { path: "/legal/privacy-policy", changefreq: "yearly" as const, priority: 0.3 },
  { path: "/legal/terms", changefreq: "yearly" as const, priority: 0.3 },
  { path: "/legal/refund-policy", changefreq: "yearly" as const, priority: 0.3 },
];

// 自定义插件：为入口 JS 文件添加 modulepreload
function modulePreloadPlugin(): Plugin {
  return {
    name: "module-preload",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;

      const preloadLinks: string[] = [];

      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (
          chunk.type === "chunk" &&
          (fileName.includes("vendor-react") ||
            fileName.includes("vendor-router"))
        ) {
          preloadLinks.push(`<link rel="modulepreload" href="/${fileName}" />`);
        }
      }

      return html.replace(
        "</head>",
        `${preloadLinks.join("\n    ")}\n  </head>`
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    modulePreloadPlugin(),
    sitemapPlugin({
      hostname: SITE_HOSTNAME,
      routes: sitemapRoutes,
      defaultChangefreq: "weekly",
      defaultPriority: 0.5,
    }),
    llmsPlugin({
      siteName: "MDZZ Toolbox",
      tagline: "Free online image tools for everyone. Process images locally in your browser with AI technology.",
      hostname: SITE_HOSTNAME,
      description: "MDZZ Toolbox is a collection of free, browser-based image processing tools. All processing happens locally on your device, ensuring maximum privacy and security.",
      coreFeatures: [
        "**100% Free**: All tools are completely free with no hidden costs",
        "**100% Local Processing**: All image processing happens in your browser, no server uploads",
        "**No Registration Required**: Use tools instantly without creating an account",
        "**Privacy First**: Your images never leave your device",
        "**AI-Powered**: Advanced AI technology for accurate results",
      ],
      tools: [
        {
          name: "Watermark Remover",
          path: "/remove-watermark",
          description: "Remove watermarks, logos, text, and unwanted objects from images using AI technology",
          features: [
            "AI-powered object removal",
            "Support for JPG, PNG, WebP, BMP, GIF, TIFF",
            "Local processing for privacy",
            "Free unlimited usage",
          ],
        },
        {
          name: "Image Translator",
          path: "/translate-image",
          description: "Translate text in images from any language. Perfect for manga, comics, documents, and more.",
          features: [
            "Support for 100+ languages",
            "Manga and comic translation",
            "Preserve original image layout",
            "AI-powered text detection",
          ],
        },
      ],
      pages: [
        { path: "/", title: "Homepage", description: "Overview of all available tools" },
        { path: "/remove-watermark", title: "Watermark Remover", description: "Remove watermarks from images" },
        { path: "/translate-image", title: "Image Translator", description: "Translate text in images" },
        { path: "/pricing", title: "Pricing", description: "Pricing plans and credits" },
        { path: "/faq", title: "FAQ", description: "Frequently asked questions" },
        { path: "/legal/privacy-policy", title: "Privacy Policy", description: "How we handle your data" },
        { path: "/legal/terms", title: "Terms of Service", description: "Terms and conditions" },
        { path: "/legal/refund-policy", title: "Refund Policy", description: "Refund and cancellation policy" },
      ],
      techStack: {
        frontend: "React 19, TypeScript, Tailwind CSS, Vite",
        backend: "Go (Echo framework), GORM, SQLite/PostgreSQL",
        deployment: "Cloudflare Pages (frontend), Docker (backend)",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 启用压缩
    minify: "esbuild",
    // CSS 代码分割
    cssCodeSplit: true,
    // 生成 source map 用于调试（生产环境可关闭）
    sourcemap: false,
    // 代码分割策略
    rollupOptions: {
      output: {
        // 手动分割 chunks
        manualChunks: {
          // React 核心库
          "vendor-react": ["react", "react-dom"],
          // 路由相关
          "vendor-router": ["react-router-dom"],
          // UI 相关
          "vendor-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "lucide-react",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
          // 表单和状态管理
          "vendor-state": [
            "zustand",
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
          ],
          // 国际化
          "vendor-i18n": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
          // 其他工具
          "vendor-utils": ["axios", "sonner", "next-themes"],
        },
        // 资源文件名格式
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || "";
          if (info.endsWith(".css")) {
            return "assets/css/[name]-[hash][extname]";
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(info)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(info)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    // 增加警告阈值
    chunkSizeWarningLimit: 500,
    // 目标浏览器
    target: "es2020",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:1323",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
