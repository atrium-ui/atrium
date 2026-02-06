import "./Playground.css";

// esbuild
import * as esbuild from "esbuild-wasm";
import esbuildUrl from "esbuild-wasm/esbuild.wasm?url";
// monaco
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?url";
import tsEditorWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?url";

import exampleCodeHtml from "./Examplecode.html.txt?raw";
import exampleCodeTsx from "./Examplecode.tsx.txt?raw";
import { useEffect, useMemo, useRef, useState } from "react";
import systemPrompt from "./system-prompt.txt?raw";
import { twMerge } from "tailwind-merge";

const files = {
  "index.html": {
    default: exampleCodeHtml,
    model: null,
  },
  "index.tsx": {
    default: exampleCodeTsx,
    model: null,
  },
} as Record<string, { default: string; model: any }>;

globalThis.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label) => {
    if (label === "typescript") {
      return tsEditorWorker;
    }
    return editorWorker;
  },
};

let initialized: Promise<void>;

async function transformCode(code: string) {
  if (!code) return;

  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: esbuildUrl });
  }
  await initialized;

  return await esbuild.transform(code, {
    sourcemap: false,
    minify: false,
    loader: "tsx",
    jsx: "transform",
    jsxFactory: "h",
    jsxImportSource: "vue",
    target: "es2021",
  });
}

async function init() {
  await import("@sv/panels");

  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: esbuildUrl });
  }
  await initialized;

  customElements.define(
    "monaco-editor",
    class CodeViewMonaco extends (HTMLElement || {}) {
      _monacoEditor;
      _model;

      async connectedCallback() {
        // TODO: styles are gone on page change
        const monaco: typeof import("monaco-editor") = await import(
          "monaco-editor/esm/vs/editor/editor.main.js"
        );

        this._monacoEditor = monaco.editor.create(this, {
          automaticLayout: true,
          wordWrap: "on",
          minimap: {
            enabled: false,
          },
          scrollbar: {
            vertical: "auto",
          },
          fontSize: 14,
          scrollBeyondLastLine: false,
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.Preserve,
          // jsxImportSource: "solid-js",
          // jsxFactory: "h",
          // jsxFragmentFactory: "Fragment",
          // allowJs: true,
          // target: monaco.languages.typescript.ScriptTarget.ESNext,
          // moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        });

        const model = monaco.editor.createModel("");
        monaco.editor.setModelLanguage(model, "typescript");
        this._monacoEditor.setModel(model);

        model.onDidChangeContent((event) => {
          this.dispatchEvent(new Event("change", { bubbles: true }));
        });

        this._model = model;

        this.load();

        this.dispatchEvent(new Event("change", { bubbles: true }));
      }

      async load() {
        const code = files[this.dataset.file].default;
        this._model.setValue(`${code}\n`);
        files[this.dataset.file].model = this._model;
      }
    },
  );
}

if (typeof window !== "undefined") {
  init();
}

const preloadMap = {
  vue: `import { h } from "vue";`,
};
const framework = "vue";

export function PlaygroundView() {
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem("playground_ai_config");
    return saved
      ? JSON.parse(saved)
      : {
          provider: "ollama" as "ollama" | "anthropic",
          endpoint: "http://localhost:11434/v1/chat/completions",
          model: "qwen2.5-coder:7b",
          apiKey: localStorage.getItem("anthropic_api_key") || "",
        };
  });

  useEffect(() => {
    localStorage.setItem("playground_ai_config", JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const iframe = useMemo(() => {
    const iframe = document.createElement("iframe");
    iframe.src = `${import.meta.env.BASE_URL}story`;
    return iframe;
  }, []);

  async function pushCode() {
    setLoading(true);
    iframe.contentWindow?.location.reload();

    await new Promise((resolve) => {
      iframe.onload = () => {
        resolve(0);
      };
    });

    const script = document.createElement("script");
    script.type = "module";
    const code = (await transformCode(files["index.tsx"]?.model?.getValue()))?.code;

    script.textContent = `${preloadMap[framework]}\n${code || ""}`;
    console.debug(script.textContent);

    const root = iframe.contentWindow?.document.querySelector("#root");
    if (root) {
      root.innerHTML = files["index.html"]?.model?.getValue() || "";
      console.info(script);
      iframe.contentWindow?.document.body.appendChild(script);
    }

    setLoading(false);
  }

  useEffect(() => {
    pushCode();
  }, []);

  async function generateWithAI() {
    if (!aiPrompt.trim()) {
      return;
    }

    const userMessage = aiPrompt.trim();
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setAiPrompt("");
    setGenerating(true);

    try {
      let generatedCode = "";

      if (aiConfig.provider === "ollama") {
        const response = await fetch(aiConfig.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: aiConfig.model,
            messages: [
              { role: "system", content: systemPrompt },
              ...chatHistory,
              { role: "user", content: userMessage },
            ],
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate layout. Check Ollama is running.");
        }

        const data = await response.json();
        generatedCode = data.choices[0].message.content;
      } else {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": aiConfig.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: aiConfig.model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [...chatHistory, { role: "user", content: userMessage }],
          }),
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401 ? "Invalid API key" : "Failed to generate layout",
          );
        }

        const data = await response.json();
        generatedCode = data.content[0].text;
      }

      if (!generatedCode) {
        throw new Error("No response from AI");
      }

      setChatHistory((prev) => {
        const updated = [...prev, { role: "assistant", content: generatedCode }];
        return updated;
      });

      // Extract code from markdown code blocks if present
      const codeBlockRegex = /```(?:tsx?|jsx?|javascript|typescript)?\n?([\s\S]*?)```/;
      const match = generatedCode.match(codeBlockRegex);

      if (match && match[1]) {
        const extractedCode = match[1].trim();
        files["index.tsx"].model?.setValue(extractedCode);
        await pushCode();
      }
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => prev.slice(0, -1));
    } finally {
      setGenerating(false);
    }
  }

  function exportCode() {
    const htmlCode = files["index.html"]?.model?.getValue() || "";
    const tsxCode = files["index.tsx"]?.model?.getValue() || "";

    const blob = new Blob(
      [
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atrium Layout Export</title>
  <script type="importmap">
  {
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js"
    }
  }
  </script>
</head>
<body>
  <div id="root">${htmlCode}</div>
  <script type="module">
    import { h } from "vue";
    ${tsxCode}
  </script>
</body>
</html>`,
      ],
      { type: "text/html" },
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    iframeContainerRef.current?.appendChild(iframe);
  }, [iframe]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generating]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`overflow-hidden border-(--style-typography-body)/10 border-r bg-(--style-typography-body)/5 transition-all duration-500 ease-in-out ${
          sidebarOpen ? "w-96" : "w-0"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)" }}
      >
        <div className="flex h-full w-96 flex-col">
          <div className="flex shrink-0 items-center justify-between border-(--style-typography-body)/10 border-b px-4 py-3">
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            {chatHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setChatHistory([])}
                className="rounded p-1 text-xs hover:bg-(--style-typography-body)/10"
                title="Clear chat"
              >
                Clear
              </button>
            )}
          </div>

          {/* Chat History */}
          <div
            ref={chatContainerRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {chatHistory.length === 0 && !generating && (
              <div className="space-y-3 px-2 py-8 text-xs opacity-70">
                <div className="font-semibold">Welcome to the AI Playground!</div>
                <div className="space-y-1.5 opacity-80">
                  <div>• Describe layouts and the AI will generate Vue 3 components</div>
                  <div>• Uses local Ollama by default (make sure it's running)</div>
                  <div>
                    • Press{" "}
                    <kbd className="rounded bg-(--style-typography-body)/10 px-1.5 py-0.5">
                      Cmd+B
                    </kbd>{" "}
                    to toggle this panel
                  </div>
                </div>
                <div className="pt-2 text-[11px] opacity-60">
                  Example: "Create a landing page with a hero section and three feature
                  cards"
                </div>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-3 text-xs ${
                  msg.role === "user"
                    ? "ml-4 bg-(--style-typography-body)/10"
                    : "mr-4 bg-(--style-typography-body)/5"
                }`}
              >
                <div className="mb-1 font-semibold opacity-70">
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <div
                  className={`whitespace-pre-wrap break-words ${msg.role === "assistant" ? "font-mono text-[11px]" : ""}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {generating && (
              <div className="mr-4 rounded-lg bg-(--style-typography-body)/5 p-3 text-xs">
                <div className="mb-1 font-semibold opacity-70">AI</div>
                <div className="opacity-50">Generating...</div>
              </div>
            )}
          </div>

          {/* AI Config */}
          <div className="shrink-0 border-(--style-typography-body)/10 border-t px-4 py-3">
            <details className="group">
              <summary className="mb-2 flex cursor-pointer items-center gap-2 font-semibold text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="h-3 w-3 transition-transform group-open:rotate-90"
                  role="img"
                  aria-label="Configuration"
                >
                  <path
                    fill="currentColor"
                    d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
                  />
                </svg>
                Configuration
              </summary>
              <div className="space-y-2 text-xs">
                <div>
                  <label htmlFor="provider" className="mb-1 block opacity-70">
                    Provider
                  </label>
                  <select
                    id="provider"
                    value={aiConfig.provider}
                    onChange={(e) =>
                      setAiConfig((prev) => ({
                        ...prev,
                        provider: e.target.value as "ollama" | "anthropic",
                        endpoint:
                          e.target.value === "ollama"
                            ? "http://localhost:11434/v1/chat/completions"
                            : "https://api.anthropic.com/v1/messages",
                        model:
                          e.target.value === "ollama"
                            ? "qwen2.5-coder:7b"
                            : "claude-sonnet-4-5-20250929",
                      }))
                    }
                    className="w-full rounded border border-(--style-typography-body)/20 bg-transparent px-2 py-1.5"
                  >
                    <option value="ollama">Ollama (Local)</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="endpoint" className="mb-1 block opacity-70">
                    Endpoint
                  </label>
                  <input
                    id="endpoint"
                    type="text"
                    value={aiConfig.endpoint}
                    onChange={(e) =>
                      setAiConfig((prev) => ({ ...prev, endpoint: e.target.value }))
                    }
                    className="w-full rounded border border-(--style-typography-body)/20 bg-transparent px-2 py-1.5"
                  />
                </div>
                <div>
                  <label htmlFor="model" className="mb-1 block opacity-70">
                    Model
                  </label>
                  <input
                    id="model"
                    type="text"
                    value={aiConfig.model}
                    onChange={(e) =>
                      setAiConfig((prev) => ({ ...prev, model: e.target.value }))
                    }
                    className="w-full rounded border border-(--style-typography-body)/20 bg-transparent px-2 py-1.5"
                  />
                </div>
                {aiConfig.provider === "anthropic" && (
                  <div>
                    <label htmlFor="apiKey" className="mb-1 block opacity-70">
                      API Key
                    </label>
                    <input
                      id="apiKey"
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => {
                        const key = e.target.value;
                        setAiConfig((prev) => ({ ...prev, apiKey: key }));
                        localStorage.setItem("anthropic_api_key", key);
                      }}
                      placeholder="sk-ant-..."
                      className="w-full rounded border border-(--style-typography-body)/20 bg-transparent px-2 py-1.5"
                    />
                  </div>
                )}
              </div>
            </details>
          </div>

          {/* Chat Input */}
          <div className="shrink-0 border-(--style-typography-body)/10 border-t px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !generating && generateWithAI()}
                placeholder="Describe a layout..."
                className="flex-1 rounded border border-(--style-typography-body)/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-(--style-typography-body)/30 focus:ring-2"
                disabled={generating}
              />
              <button
                type="button"
                className="rounded bg-(--style-typography-body) px-3 py-2 font-medium text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                onClick={() => generateWithAI()}
                disabled={generating || !aiPrompt.trim()}
              >
                {generating ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Button Sidebar */}
      <div className="flex flex-col items-center gap-3 border-(--style-typography-body)/10 border-r bg-(--style-typography-body)/5 px-2 py-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-(--style-typography-body)/10"
          title={`${sidebarOpen ? "Hide" : "Show"} AI sidebar (Cmd+B)`}
        >
          {sidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="h-5 w-5"
              role="img"
              aria-label="Hide sidebar"
            >
              <path
                fill="currentColor"
                d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H96V200H40ZM216,200H112V56H216V200ZM165.66,146.34a8,8,0,0,1-11.32,11.32l-24-24a8,8,0,0,1,0-11.32l24-24a8,8,0,0,1,11.32,11.32L147.31,128Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="h-5 w-5"
              role="img"
              aria-label="Show sidebar"
            >
              <path
                fill="currentColor"
                d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200ZM165.66,109.66,183.31,128l-17.65,17.66a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32Z"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="rounded-lg p-2 transition-colors hover:bg-(--style-typography-body)/10"
          onClick={() => exportCode()}
          title="Export layout as HTML"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="h-5 w-5"
            role="img"
            aria-label="Export"
          >
            <path
              fill="currentColor"
              d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"
            />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <a-panel-layout className="h-full flex-1">
          <a-panel-group className="grid-rows-[1.5fr_0.5fr]">
            <a-panel>
              <div className={twMerge("flex h-full flex-col", loading && "opacity-40")}>
                <div className="flex-1" ref={iframeContainerRef} />
              </div>
            </a-panel>
            <a-panel tabs onChange={pushCode}>
              <monaco-editor data-file="index.html" tab="index.html" />
              <monaco-editor data-file="index.tsx" tab="index.tsx" />
            </a-panel>
          </a-panel-group>
        </a-panel-layout>
      </div>
    </div>
  );
}
