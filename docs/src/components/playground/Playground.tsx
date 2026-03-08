import {
  PlaygroundEditorsPanel,
  PlaygroundPreviewPanel,
  PlaygroundProvider,
  type PlaygroundApi,
  type PlaygroundFiles,
} from "@sv/playground";
import exampleCodeHtml from "./Examplecode.html.txt?raw";
import exampleCodeTsx from "./Examplecode.tsx.txt?raw";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AIChatPanel } from "./AIChatPanel.js";

const DEFAULT_FILES: PlaygroundFiles = {
  "index.html": exampleCodeHtml,
  "index.tsx": exampleCodeTsx,
};

export function DocsPlayground({
  previewUrl,
}: {
  previewUrl: string;
}) {
  const playgroundRef = useRef<PlaygroundApi>(null);
  const [leftTab, setLeftTab] = useState<"code" | "ai">("code");
  const [currentFiles, setCurrentFiles] = useState<PlaygroundFiles>(DEFAULT_FILES);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault();
        setLeftTab((prev) => (prev === "code" ? "ai" : "code"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <PlaygroundProvider
        ref={playgroundRef}
        previewUrl={previewUrl}
        defaultFiles={DEFAULT_FILES}
        onFilesChange={(files) => setCurrentFiles(files)}
      >
        <div className="grid min-h-0 flex-1 gap-px bg-black/10 lg:grid-cols-[minmax(0,2fr)_minmax(0,4fr)]">
          <div className="flex min-h-[45vh] min-w-0 flex-col bg-white">
            <div className="flex items-center justify-between border-black/10 border-b px-3 py-2">
              <div className="flex gap-1 rounded-full bg-black/5 p-1">
                <button
                  type="button"
                  onClick={() => setLeftTab("code")}
                  aria-pressed={leftTab === "code"}
                  className={twMerge(
                    "rounded-full px-3 py-1.5 font-medium text-xs transition-colors",
                    leftTab === "code" ? "bg-white shadow-sm" : "hover:bg-black/5",
                  )}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab("ai")}
                  aria-pressed={leftTab === "ai"}
                  className={twMerge(
                    "rounded-full px-3 py-1.5 font-medium text-xs transition-colors",
                    leftTab === "ai" ? "bg-white shadow-sm" : "hover:bg-black/5",
                  )}
                  title="Switch to AI panel (Cmd+B)"
                >
                  AI
                </button>
              </div>

              <button
                type="button"
                className="rounded px-3 py-1.5 font-medium text-xs transition-colors hover:bg-black/5"
                onClick={() => playgroundRef.current?.exportCode()}
                title="Export layout as HTML"
              >
                Export
              </button>
            </div>

            <div className={twMerge("min-h-0 flex-1", leftTab === "code" ? "block" : "hidden")}>
              <PlaygroundEditorsPanel className="min-h-0 h-full bg-white" />
            </div>

            <AIChatPanel
              className={leftTab === "ai" ? "flex" : "hidden"}
              currentFiles={currentFiles}
              defaultFiles={DEFAULT_FILES}
              playgroundRef={playgroundRef}
              setCurrentFiles={setCurrentFiles}
            />
          </div>

          <PlaygroundPreviewPanel className="min-h-[45vh] bg-white" />
        </div>
      </PlaygroundProvider>
    </div>
  );
}
