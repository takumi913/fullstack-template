import { useTheme } from "./ThemeProvider";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { useLocale } from "@/i18n/context";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const copy = () => toolsmithCopy(locale());
  return (
    <button
      type="button"
      class="design-theme-toggle"
      title={copy().themeTip}
      aria-label={copy().themeTip}
      onClick={() => setTheme(theme() === "dark" ? "light" : "dark")}
    >
      <span class="design-theme-glyph" aria-hidden="true" />
    </button>
  );
}
