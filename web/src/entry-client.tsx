import { hydrate, render } from "@solidjs/web";
import App from "./root";
import Document from "./Document";

if (document.documentElement.dataset.spa === "true") {
  render(() => <App />, document.getElementById("app")!);
} else {
  hydrate(
    () => (
      <Document>
        <App />
      </Document>
    ),
    document,
  );
}
