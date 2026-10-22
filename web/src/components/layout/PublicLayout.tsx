import type { JSX } from "@solidjs/web";
import { Footer } from "./Footer";
import { PublicHeader } from "./PublicHeader";
import { PointerGlow } from "./DesignEffects";
import { CommandPalette } from "./CommandPalette";

export function PublicLayout(props: { children?: JSX.Element }) {
  return (
    <div class="design-site">
      <PointerGlow />
      <PublicHeader />
      <main>{props.children}</main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
