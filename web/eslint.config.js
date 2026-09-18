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
