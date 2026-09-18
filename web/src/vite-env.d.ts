/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_SHORT_NAME?: string;
  readonly VITE_SITE_MARK?: string;
  readonly VITE_SITE_FAVICON?: string;
  readonly VITE_SITE_LOCALE?: string;
  readonly VITE_SITE_PRIMARY_KEYWORD?: string;
  readonly VITE_SITE_TITLE?: string;
  readonly VITE_SITE_DESCRIPTION?: string;
  readonly VITE_SITE_IMAGE?: string;
  readonly VITE_HOME_PRIMARY_TOOL_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
