import "./Playground.css";

import * as esbuild from "esbuild-wasm";
import esbuildUrl from "esbuild-wasm/esbuild.wasm?url";
import defaultHtml from "./default-index.html.txt?raw";
import defaultTsx from "./default-index.tsx.txt?raw";
import "./CodeEditor.js";
import type { SvCodeEditorElement } from "./CodeEditor.js";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";

type FileName = "index.html" | "index.tsx";

export type PlaygroundFiles = Record<FileName, string>;

export type PlaygroundApi = {
  exportCode(): void;
  getFiles(): PlaygroundFiles;
  pushCode(): Promise<void>;
  setFile(fileName: FileName, value: string): void;
  setFiles(files: Partial<PlaygroundFiles>): void;
};

export type PlaygroundProviderProps = {
  children: ReactNode;
  defaultFiles?: Partial<PlaygroundFiles>;
  frameworkPrelude?: string;
  onFilesChange?: (files: PlaygroundFiles) => void;
  previewUrl: string;
};

type PlaygroundContextValue = {
  editorRefs: MutableRefObject<Partial<Record<FileName, SvCodeEditorElement | null>>>;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  loading: boolean;
  registerEditor: (fileName: FileName, editor: SvCodeEditorElement | null) => void;
};

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

let initialized: Promise<void> | undefined;

async function initEsbuild() {
  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: esbuildUrl });
  }
  await initialized;
}

async function transformCode(code: string) {
  if (!code) {
    return;
  }

  await initEsbuild();

  return esbuild.transform(code, {
    sourcemap: false,
    minify: false,
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "h",
    jsxImportSource: "vue",
    target: "es2021",
  });
}

function usePlaygroundContext() {
  const value = useContext(PlaygroundContext);
  if (!value) {
    throw new Error("Playground panels must be rendered inside PlaygroundProvider.");
  }
  return value;
}

export const PlaygroundProvider = forwardRef<PlaygroundApi, PlaygroundProviderProps>(
  function PlaygroundProvider(
    {
      children,
      defaultFiles,
      frameworkPrelude = `import { h } from "vue";`,
      onFilesChange,
      previewUrl,
    },
    ref,
  ) {
    const initialFiles = useMemo<PlaygroundFiles>(
      () => ({
        "index.html": defaultFiles?.["index.html"] ?? defaultHtml,
        "index.tsx": defaultFiles?.["index.tsx"] ?? defaultTsx,
      }),
      [defaultFiles],
    );
    const currentFilesRef = useRef<PlaygroundFiles>(initialFiles);
    const editorRefs = useRef<Partial<Record<FileName, SvCodeEditorElement | null>>>({});
    const editorCleanupRefs = useRef<Partial<Record<FileName, () => void>>>({});
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const pushTimeoutRef = useRef<number | null>(null);
    const initialPushDoneRef = useRef(false);
    const [loading, setLoading] = useState(false);

    const emitFilesChange = () => {
      onFilesChange?.({ ...currentFilesRef.current });
    };

    const pushCode = async () => {
      const iframe = iframeRef.current;
      if (!iframe) {
        return;
      }

      setLoading(true);

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.src = previewUrl;
      });

      const transformed = await transformCode(currentFilesRef.current["index.tsx"]);
      const previewWindow = iframe.contentWindow;
      if (!previewWindow) {
        setLoading(false);
        return;
      }

      const root = previewWindow.document.querySelector("#root");
      if (root) {
        root.innerHTML = currentFilesRef.current["index.html"];
        const script = previewWindow.document.createElement("script");
        script.type = "module";
        script.textContent = `${frameworkPrelude}\n${transformed?.code ?? ""}`;
        previewWindow.document.body.appendChild(script);
      }

      setLoading(false);
    };

    const schedulePushCode = () => {
      if (pushTimeoutRef.current) {
        window.clearTimeout(pushTimeoutRef.current);
      }

      pushTimeoutRef.current = window.setTimeout(() => {
        void pushCode();
      }, 250);
    };

    const setFile = (fileName: FileName, value: string) => {
      currentFilesRef.current = {
        ...currentFilesRef.current,
        [fileName]: value,
      };

      const editor = editorRefs.current[fileName];
      if (editor && editor.value !== value) {
        editor.value = value;
      }

      emitFilesChange();
      if (initialPushDoneRef.current && !editor) {
        schedulePushCode();
      }
    };

    const setFiles = (files: Partial<PlaygroundFiles>) => {
      for (const [fileName, value] of Object.entries(files) as Array<
        [FileName, string | undefined]
      >) {
        if (typeof value === "string") {
          setFile(fileName, value);
        }
      }
    };

    const exportCode = () => {
      throw new Error("Not implemenetd.");
    };

    const registerEditor = (fileName: FileName, editor: SvCodeEditorElement | null) => {
      editorCleanupRefs.current[fileName]?.();
      delete editorCleanupRefs.current[fileName];

      editorRefs.current[fileName] = editor;

      if (!editor) {
        return;
      }

      editor.value = currentFilesRef.current[fileName];

      const handleChange = () => {
        currentFilesRef.current = {
          ...currentFilesRef.current,
          [fileName]: editor.value,
        };
        emitFilesChange();
        if (initialPushDoneRef.current) {
          schedulePushCode();
        }
      };

      editor.addEventListener("change", handleChange);
      editorCleanupRefs.current[fileName] = () => {
        editor.removeEventListener("change", handleChange);
      };
    };

    useImperativeHandle(
      ref,
      () => ({
        exportCode,
        getFiles: () => ({ ...currentFilesRef.current }),
        pushCode,
        setFile,
        setFiles,
      }),
      [previewUrl, frameworkPrelude],
    );

    useEffect(() => {
      currentFilesRef.current = initialFiles;
      emitFilesChange();
    }, [initialFiles]);

    useEffect(() => {
      void (async () => {
        await initEsbuild();

        if (!initialPushDoneRef.current) {
          initialPushDoneRef.current = true;
          await pushCode();
        }
      })();

      return () => {
        if (pushTimeoutRef.current) {
          window.clearTimeout(pushTimeoutRef.current);
        }
        for (const dispose of Object.values(editorCleanupRefs.current)) {
          dispose?.();
        }
        editorCleanupRefs.current = {};
      };
    }, [initialFiles, previewUrl, frameworkPrelude]);

    return (
      <PlaygroundContext.Provider value={{ editorRefs, iframeRef, loading, registerEditor }}>
        {children}
      </PlaygroundContext.Provider>
    );
  },
);

export function PlaygroundPreviewPanel({
  className,
}: {
  className?: string;
}) {
  const { iframeRef, loading } = usePlaygroundContext();

  return (
    <div className={twMerge("sv-playground-panel", className)}>
      <div className={twMerge("flex h-full flex-col", loading && "opacity-40")}>
        <iframe
          ref={(node) => {
            iframeRef.current = node;
          }}
          className="sv-playground-preview flex-1"
          title="Playground Preview"
        />
      </div>
    </div>
  );
}

export function PlaygroundEditorsPanel({
  className,
}: {
  className?: string;
}) {
  const { registerEditor } = usePlaygroundContext();

  return (
    <div className={twMerge("sv-playground-panel grid min-h-0 gap-px bg-black/10", className)}>
      <div className="flex min-h-0 flex-col bg-white">
        <div className="border-black/10 border-b px-3 py-2 font-medium text-xs">index.html</div>
        <sv-code-editor
          className="sv-playground-editor min-h-0 flex-1"
          language="html"
          ref={(node) => {
            registerEditor("index.html", node as SvCodeEditorElement | null);
          }}
        />
      </div>
      <div className="flex min-h-0 flex-col bg-white">
        <div className="border-black/10 border-b px-3 py-2 font-medium text-xs">index.tsx</div>
        <sv-code-editor
          className="sv-playground-editor min-h-0 flex-1"
          language="tsx"
          ref={(node) => {
            registerEditor("index.tsx", node as SvCodeEditorElement | null);
          }}
        />
      </div>
    </div>
  );
}
