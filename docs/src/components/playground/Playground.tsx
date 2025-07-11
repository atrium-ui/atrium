import "./Playground.css";

import "@sv/elements/blur";
import "@sv/elements/list";

// esbuild
import * as esbuild from "esbuild-wasm";
import esbuildUrl from "esbuild-wasm/esbuild.wasm?url";
// monaco
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?url";
import tsEditorWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?url";

import exampleCodeHtml from "./Examplecode.html.txt?raw";
import exampleCodeTsx from "./Examplecode.tsx.txt?raw";
import { Toast } from "@sv/elements/toast";
import { Blur } from "@sv/elements/blur";
import { css, html } from "lit";
import { useEffect, useMemo, useRef, useState } from "react";

const componentsImports = import.meta.glob(
  "./../../../../packages/components/src/vue/*.tsx",
  {
    query: "?raw",
  },
);

const SHARE_SERVICE_URL = "https://lkydy-sharing.deno.dev/";

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

class CustomToast extends Toast {
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        transition: opacity .5s ease, height 0.5s ease, margin 0.5s ease, transform 0.5s ease;
        min-width: 220px;
        max-width: 500px;
        margin-top: 1rem;
        margin-bottom: 1rem;
      }
      div {
        padding: 0.25rem 0;
      }
    `;
  }

  protected render() {
    return html`<slot><div><slot>${this.message}</slot></div></slot>`;
  }
}

customElements.define("custom-toast", CustomToast);

async function init() {
  await import("@atrium-ui/layout");

  if (!initialized) {
    initialized = esbuild.initialize({ wasmURL: esbuildUrl });
  }
  await initialized;

  customElements.define(
    "command-menu",
    class CommandMenu extends Blur {
      constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `
          <slot></slot>
        `;
      }

      connectedCallback() {
        super.connectedCallback();

        this.innerHTML = `
          <a-list className="commandmenu">
            <input type="text" placeholder="Search..." />
            <div className="commandmenu-list" />
          </a-list>
        `;

        const allComponentsCode = Object.entries(componentsImports).reduce(
          (acc, [key, value]) => {
            const name = key.split("/").pop()?.replace(".tsx", "");
            if (!name) return acc;
            acc[name] = value;
            return acc;
          },
          {},
        );

        const menuList = this.querySelector(".commandmenu");
        window.addEventListener("keydown", (event) => {
          if (event.key === "p" && event.metaKey) {
            this.enable();
            event.preventDefault();
            event.stopPropagation();
          }
        });
        menuList?.addEventListener("change", async (event) => {
          const value = menuList.getValueOfOption(event.option);
          this.disable();

          // copy component code
          const module = await allComponentsCode[value]();
          navigator.clipboard.writeText(module.default);
        });

        const input = this.querySelector("input");
        const list = this.querySelector(".commandmenu-list");

        if (input && list) {
          const renderList = () => {
            const filter = input?.value.toLowerCase();
            list.innerHTML = "";

            for (const item of Object.keys(allComponentsCode)) {
              if (!item.toLowerCase().match(filter)) continue;

              const itemElement = document.createElement("a-list-item");
              itemElement.setAttribute("value", item);
              itemElement.innerHTML = item;
              list.appendChild(itemElement);
            }
          };

          input?.addEventListener("input", renderList);

          renderList();
        }
      }
    },
  );

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

  const iframe = useMemo(() => {
    const iframe = document.createElement("iframe");
    iframe.src = `${import.meta.env.BASE_URL}story`;
    return iframe;
  }, []);

  async function loadFiles() {
    const query = location.search.slice(1);
    if (query) {
      const remotePreset = await fetch(`${SHARE_SERVICE_URL}${query}`).then((response) =>
        response.text(),
      );
      files["index.tsx"].default = remotePreset;
    }
  }

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
      root.innerHTML = files["index.html"]?.model?.getValue();
      console.info(script);
      iframe.contentWindow?.document.body.appendChild(script);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadFiles().then(pushCode());
  }, []);

  async function share() {
    try {
      const value = files["index.tsx"]?.model.getValue();
      const uid = await fetch(SHARE_SERVICE_URL, {
        method: "POST",
        body: value,
      }).then((response) => response.text());

      const url = `${location.origin}${location.pathname}?${uid}`;
      showToast(url, () => {
        navigator.clipboard.writeText(url);
        showToast("Copied!");
      });
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  }

  const GEMINI_SERVICE_URL = new URLSearchParams(location.search).get("gemini");

  async function gemini() {
    const clipboardContents = await navigator.clipboard.read();

    const toast = showToast("Pasting image...");

    try {
      for (const item of clipboardContents) {
        if (item.types.includes("image/png")) {
          const blob = await item.getType("image/png");
          const formData = new FormData();
          formData.append("image", blob);

          toast.innerText = "Waiting for response...";

          console.info(...formData);

          const response = await fetch(GEMINI_SERVICE_URL, {
            method: "POST",
            body: formData,
          }).then((response) => response.text());

          console.info(response);

          await navigator.clipboard.writeText(response);

          toast.innerText = "Copied response to clipboard";

          return;
        }
      }
    } catch (error) {
      toast.kill();
      console.error(error);
      showToast(error.message);
      return;
    }

    showToast("No image to paste");
  }

  const iframeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    iframeContainerRef.current?.appendChild(iframe);
  }, [iframe]);

  return (
    <div className={["relative", "not-content"].join(" ")}>
      <div className="flex">
        <div className="flex hidden flex-col gap-2 p-2">
          <button
            type="button"
            className="cursor-pointer rounded bg-blue-500 p-3 font-bold text-white hover:bg-blue-700"
            onClick={() => share()}
            title="share"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="h-[1em] w-[1em]"
            >
              <title>Share</title>
              <path
                fill="currentColor"
                d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,112H165a88,88,0,0,0-85.23,66,8,8,0,0,1-15.5-4A103.94,103.94,0,0,1,165,96h39.71L170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66ZM192,208H40V88a8,8,0,0,0-16,0V216a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16Z"
              />
            </svg>
          </button>

          {GEMINI_SERVICE_URL ? (
            <button
              type="button"
              className="cursor-pointer rounded bg-blue-500 p-3 font-bold text-white hover:bg-blue-700"
              onClick={() => gemini()}
              title="gemini"
            >
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[1em] w-[1em]"
              >
                <title>Gemini</title>
                <path
                  d="M12.0002 23C12.0002 21.4783 11.7068 20.0483 11.1199 18.71C10.5519 17.3717 9.7725 16.2075 8.7826 15.2175C7.7927 14.2275 6.62836 13.4483 5.29001 12.88C3.95167 12.2933 2.5218 12 1 12C2.5218 12 3.95167 11.7159 5.29001 11.1475C6.62836 10.5609 7.7927 9.7725 8.7826 8.78252C9.7725 7.7925 10.5519 6.62834 11.1199 5.29C11.7068 3.95167 12.0002 2.52167 12.0002 1C12.0002 2.52167 12.2842 3.95167 12.8526 5.29C13.4391 6.62834 14.2275 7.7925 15.2174 8.78252C16.2077 9.7725 17.3716 10.5609 18.71 11.1475C20.0483 11.7159 21.4786 12 23 12C21.4786 12 20.0483 12.2933 18.71 12.88C17.3716 13.4483 16.2077 14.2275 15.2174 15.2175C14.2275 16.2075 13.4391 17.3717 12.8526 18.71C12.2842 20.0483 12.0002 21.4783 12.0002 23Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : (
            ""
          )}
        </div>

        <a-layout className="z-0">
          <a-layout-column>
            <a-layout-group tabs onChange={pushCode}>
              <monaco-editor data-file="index.html" tab="index.html" />
              <monaco-editor data-file="index.tsx" tab="index.tsx" />
            </a-layout-group>
          </a-layout-column>
          <a-layout-column>
            <a-layout-group tabs>
              <div tab="Preview" className="flex h-full flex-col">
                {loading ? <div>Loading...</div> : null}
                <div className="flex-1" ref={iframeContainerRef} />
              </div>
            </a-layout-group>
          </a-layout-column>
        </a-layout>
      </div>

      <command-menu />
    </div>
  );
}
