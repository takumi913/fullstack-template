import { createContext, useContext, type ReactNode } from "react";
import type { ToolPageDefinition } from "@/content/tool-pages";

const ToolPageContext = createContext<ToolPageDefinition | null>(null);

export function ToolPageProvider({
  page,
  children,
}: {
  page: ToolPageDefinition;
  children: ReactNode;
}) {
  return <ToolPageContext.Provider value={page}>{children}</ToolPageContext.Provider>;
}

export function useToolPageDefinition() {
  const page = useContext(ToolPageContext);

  if (!page) {
    throw new Error("useToolPageDefinition must be used inside ToolPageProvider");
  }

  return page;
}
