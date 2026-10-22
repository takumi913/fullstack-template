import js from "@eslint/js";
import globals from "globals";
import solid from "eslint-plugin-solid/configs/v2";
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
    plugins: solid.plugins,
    settings: solid.settings,
    rules: solid.rules,
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
);
