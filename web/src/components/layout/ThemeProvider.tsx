import { createContext, createEffect, createSignal, onSettled, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";

type Theme = "light" | "dark";
const storageKey = "toolsmith-theme";
const ThemeContext = createContext<{
  theme: () => Theme;
  setTheme: (theme: Theme) => void;
}>();

export const themeBootstrap = `(()=>{const t=localStorage.getItem("${storageKey}");document.documentElement.dataset.theme=t==="light"?"light":"dark"})()`;

export function ThemeProvider(props: { children: JSX.Element }) {
  const [theme, setTheme] = createSignal<Theme>(
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark",
  );
  onSettled(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    const synchronize = (event: StorageEvent) => {
      if (event.key === storageKey) setTheme(event.newValue === "light" ? "light" : "dark");
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  });
  createEffect(theme, (value) => {
    document.documentElement.dataset.theme = value;
    localStorage.setItem(storageKey, value);
  });
  return <ThemeContext value={{ theme, setTheme }}>{props.children}</ThemeContext>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
