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
import {
  decodeSharedPlaygroundFiles,
  encodeSharedPlaygroundFiles,
} from "./share-state.js";

const DEFAULT_FILES: PlaygroundFiles = {
  "index.html": exampleCodeHtml,
  "index.tsx": exampleCodeTsx,
};
const SHARE_PARAM = "playground";

export function DocsPlayground({ previewUrl }: { previewUrl: string }) {
  const playgroundRef = useRef<PlaygroundApi>(null);
  const [leftTab, setLeftTab] = useState<"code" | "ai">("code");
  const [currentFiles, setCurrentFiles] = useState<PlaygroundFiles>(DEFAULT_FILES);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  async function loadPlaygroundFiles(files: PlaygroundFiles) {
    setCurrentFiles(files);
    playgroundRef.current?.setFiles(files);
    await playgroundRef.current?.pushCode();
  }

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

  useEffect(() => {
    async function loadSharedStateFromUrl() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const sharedState = hash.get(SHARE_PARAM);

      if (!sharedState) {
        return;
      }

      try {
        const files = await decodeSharedPlaygroundFiles(sharedState);
        await loadPlaygroundFiles(files);
      } catch (error) {
        console.error("Failed to load shared playground state.", error);
        setShareStatus("Invalid share URL");
      }
    }

    void loadSharedStateFromUrl();
  }, []);

  useEffect(() => {
    if (!shareStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => setShareStatus(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [shareStatus]);

  async function handleShare() {
    try {
      const encoded = await encodeSharedPlaygroundFiles(currentFiles);
      const url = new URL(window.location.href);
      url.hash = new URLSearchParams({ [SHARE_PARAM]: encoded }).toString();

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        setShareStatus("Link copied");
        return;
      }

      setShareStatus("Clipboard unavailable");
    } catch (error) {
      console.error("Failed to share playground state.", error);
      setShareStatus("Share failed");
    }
  }

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

              <div className="flex items-center gap-2">
                {shareStatus && (
                  <div className="text-[11px] text-black/55">{shareStatus}</div>
                )}
                <button
                  type="button"
                  className="rounded px-3 py-1.5 font-medium text-xs transition-colors hover:bg-black/5"
                  onClick={() => void handleShare()}
                  title="Copy a shareable URL with the current files"
                >
                  Share
                </button>
              </div>
            </div>

            <div
              className={twMerge(
                "min-h-0 flex-1",
                leftTab === "code" ? "block" : "hidden",
              )}
            >
              <PlaygroundEditorsPanel className="h-full min-h-0 bg-white" />
            </div>

            <AIChatPanel
              className={leftTab === "ai" ? "flex" : "hidden"}
              currentFiles={currentFiles}
              defaultFiles={DEFAULT_FILES}
              playgroundRef={playgroundRef}
              loadPlaygroundFiles={loadPlaygroundFiles}
              setCurrentFiles={setCurrentFiles}
            />
          </div>

          <PlaygroundPreviewPanel className="min-h-[45vh] bg-white" />
        </div>
      </PlaygroundProvider>
    </div>
  );
}
