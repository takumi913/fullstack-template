import { useTheme } from "next-themes";
import { toolsmithCopy } from "@/config/toolsmith-copy";
import { useLocale } from "@/i18n/useLocale";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const copy = toolsmithCopy(useLocale());
  return (
    <button
      type="button"
      className="design-theme-toggle"
      title={copy.themeTip}
      aria-label={copy.themeTip}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="design-theme-glyph" aria-hidden="true" />
    </button>
  );
}
