import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Public shell code is loaded by every prerendered SEO page. Keep private app
    // state/API code and full content registries out of this dependency boundary.
    files: [
      "src/components/layout/PublicHeader.tsx",
      "src/components/layout/PublicLayout.tsx",
      "src/components/layout/Footer.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/api",
                "@/api/*",
                "@/store",
                "@/store/*",
                "@/router/RouteGuards",
                "@/content",
                "@/content/*",
              ],
              message:
                "Public layout code must stay lightweight. Link through hubs/components instead of loading private app state or content registries.",
            },
          ],
        },
      ],
    },
  },
  {
    // React Router Framework Mode route modules intentionally export meta/links/loaders
    // next to the route component. Registry/context modules are infrastructure rather
    // than Fast Refresh leaf components, so the same React Refresh rule is not useful.
    files: [
      "src/root.tsx",
      "src/routes/**/*.tsx",
      "src/tools/context.tsx",
      "src/tools/registry.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
