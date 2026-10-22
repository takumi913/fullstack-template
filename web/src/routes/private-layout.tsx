import type { JSX } from "@solidjs/web";
import { AppStateProvider } from "@/store/AppState";

export default function PrivateLayout(props: { children?: JSX.Element }) {
  return <AppStateProvider>{props.children}</AppStateProvider>;
}
