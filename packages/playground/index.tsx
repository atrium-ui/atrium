import { createRoot } from "react-dom/client";
import {
  PlaygroundEditorsPanel,
  PlaygroundPreviewPanel,
  PlaygroundProvider,
} from "./src/index.js";

createRoot(document.querySelector("#app")!).render(
  <div className="grid h-screen grid-cols-2 gap-px bg-black/10">
    <PlaygroundProvider previewUrl="/preview.html">
      <PlaygroundEditorsPanel className="bg-white" />
      <PlaygroundPreviewPanel className="bg-white" />
    </PlaygroundProvider>
  </div>,
);
