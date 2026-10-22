import { createContext, useContext, type Element } from "solid-js";
import type { ToolPageDefinition } from "@/content/tool-pages";

const ToolPageContext = createContext<{ readonly page: ToolPageDefinition }>();

export function ToolPageProvider(props: { page: ToolPageDefinition; children?: Element }) {
  return (
    <ToolPageContext
      value={{
        get page() {
          return props.page;
        },
      }}
    >
      {props.children}
    </ToolPageContext>
  );
}

export function useToolPageDefinition() {
  const context = useContext(ToolPageContext);
  return () => context.page;
}
