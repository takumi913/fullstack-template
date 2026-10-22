import { renderToStream } from "@solidjs/web";
import manifest from "virtual:solid-manifest";
import App from "./root";
import Document from "./Document";

export function render() {
  return renderToStream(
    () => (
      <Document>
        <App />
      </Document>
    ),
    {
      manifest,
    },
  );
}
