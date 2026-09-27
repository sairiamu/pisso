import { Buffer } from "buffer";
// intel-hex (used by simulator/engine.ts to parse compiled .hex files)
// expects Node's global Buffer, which doesn't exist in the Tauri webview.
// Polyfill it once, at startup, before any code that might call parse().
if (!("Buffer" in globalThis)) {
  (globalThis as any).Buffer = Buffer;
}

import ReactDOM from "react-dom/client";
import App from "./app/App";
import { AppProviders } from "./app/providers/AppProviders";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppProviders>
    <App />
  </AppProviders>
);
