import "./Playground.css";

import "@sv/elements/blur";
import "@sv/elements/list";

// esbuild
import * as esbuild from "esbuild-wasm";
import esbuildUrl from "esbuild-wasm/esbuild.wasm?url";
// monaco
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?url";
import tsEditorWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?url";

import exampleCodeHtml from "./playground/Examplecode.html.txt?raw";
import exampleCodeTsx from "./playground/Examplecode.tsx.txt?raw";
import { Toast } from "@sv/elements/toast";

const SHARE_SERVICE_URL = "https://lkydy-sharing.deno.dev/";

globalThis.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label) => {
    if (label === "typescript") {
      return tsEditorWorker;
    }
    return editorWorker;
  },
};

const componentsImports = import.meta.glob(
  "./../../../../packages/components/src/vue/*.tsx",
  {
    query: "?raw",
  },
);

const allComponentsCode = Object.entries(componentsImports).reduce(
  (acc, [key, value]) => {
    const name = key.split("/").pop()?.replace(".tsx", "");
    if (!name) return acc;
    acc[name] = value;
    return acc;
  },
  {},
);

async function transform(code: string) {
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

let iframe: HTMLIFrameElement;

async function init() {
  iframe = document.createElement("iframe");
  iframe.src = "/atrium/story";

  await import("@atrium-ui/layout");
  await esbuild.initialize({ wasmURL: esbuildUrl });
  const monaco: typeof import("monaco-editor") = await import(
    "monaco-editor/esm/vs/editor/editor.main.js"
  );

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

  const query = location.search.slice(1);
  if (query) {
    const remotePreset = await fetch(`${SHARE_SERVICE_URL}${query}`).then((response) =>
      response.text(),
    );
    files["index.tsx"].default = remotePreset;
  }

  async function pushCode(iframe: HTMLIFrameElement, _files: typeof files) {
    iframe.contentWindow.location.reload();

    await new Promise((resolve) => {
      iframe.onload = resolve;
    });

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `import { h } from "vue";\n${(await transform(_files["index.tsx"]?.model.getValue())).code}`;
    console.debug(script.textContent);

    const root = iframe.contentWindow.document.querySelector("#root");
    if (root) {
      root.innerHTML = _files["index.html"]?.model.getValue();
      iframe.contentWindow.document.body.appendChild(script);
    }
  }

  async function share() {
    try {
      const value = files["index.tsx"]?.model.getValue();
      const uid = await fetch(SHARE_SERVICE_URL, {
        method: "POST",
        body: value,
      }).then((response) => response.text());

      const url = `${location.origin}${location.pathname}?${uid}`;
      const toast = new Toast({
        message: url,
        onClick: () => {
          navigator.clipboard.writeText(url);
        },
      });
      toastfeed.append(toast);
    } catch (error) {
      const toast = new Toast({
        message: error.message,
        onClick: () => {
          navigator.clipboard.writeText(url);
        },
      });
      toastfeed.append(toast);
      console.error(error);
    }
  }

  function initCommandMenu() {
    const menu = document.querySelector(".commandmenu-wrapper");
    const menuList = document.querySelector(".commandmenu");
    window.addEventListener("keydown", (event) => {
      if (event.key === "p" && event.metaKey) {
        menu?.enable();
        event.preventDefault();
        event.stopPropagation();
      }
    });
    menuList?.addEventListener("change", async (event) => {
      const value = menuList.getValueOfOption(event.option);
      menu?.disable();

      // copy component code
      const module = await allComponentsCode[value]();
      navigator.clipboard.writeText(module.default);
    });

    const input = document.querySelector("input");
    const list = document.querySelector(".commandmenu-list");

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

  initCommandMenu();

  customElements.define(
    "monaco-editor",
    class CodeViewMonaco extends HTMLElement {
      _monacoEditor;
      _model;

      constructor() {
        super();

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
          pushCode(iframe, files);
        });

        this._model = model;

        this.load();

        pushCode(iframe, files);
      }

      async load() {
        const code = files[this.dataset.file].default;
        this._model.setValue(`${code}\n`);
        files[this.dataset.file].model = this._model;
      }
    },
  );

  return {
    share,
  };
}

export function Playground() {
  let share: () => Promise<string>;

  init().then((exp) => {
    share = exp.share;
  });

  return (
    <div class={["relative", "not-content"].join(" ")}>
      <a-layout class="z-0">
        <a-layout-column>
          <a-layout-group tabs>
            <monaco-editor data-file="index.html" tab="index.html" />
            <monaco-editor data-file="index.tsx" tab="index.tsx" />
          </a-layout-group>
        </a-layout-column>
        <a-layout-column>
          <a-layout-group tabs>
            <div tab="Preview">{iframe}</div>
          </a-layout-group>
        </a-layout-column>
      </a-layout>

      <div class="-top-16 absolute right-4 z-50">
        <button
          type="button"
          class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => {
            share();
          }}
        >
          Share
        </button>
      </div>

      <a-blur class="commandmenu-wrapper">
        <a-list class="commandmenu">
          <input type="text" placeholder="Search..." />
          <div class="commandmenu-list" />
        </a-list>
      </a-blur>

      <a-toast-feed id="toastfeed" class="absolute right-4 bottom-4 z-50" />
    </div>
  );
}
