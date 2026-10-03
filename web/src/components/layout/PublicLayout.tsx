import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { PublicHeader } from "./PublicHeader";
import { PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";

export function PublicLayout() {
  return (
    <div className="design-site">
      <PointerGlow />
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
