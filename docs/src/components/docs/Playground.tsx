import "./Playground.css";
// esbuild
import * as esbuild from "esbuild-wasm";
import esbuildUrl from "esbuild-wasm/esbuild.wasm?url";
// monaco
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?url";
import tsEditorWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?url";

const exampleCode = `
import { createApp, ref } from 'vue';
import type { Track } from "@sv/elements/track";
import { twMerge } from "tailwind-merge";
import { computed, defineComponent, onMounted, ref } from "vue";

const Slider = defineComponent(
  (props, { slots }) => {
    const track = ref<Track>();
    const current = ref(0);
    const width = ref(0);
    const position = ref(0);
    const itemCount = ref(1);
    const overflowWidth = ref(0);

    const showNext = computed(() => position.value < overflowWidth.value);
    const showPrev = computed(() => position.value > 100);

    const progress = computed(() => {
      const value = 1 - (overflowWidth.value - position.value) / overflowWidth.value;
      return Math.min(1, Math.max(0, value));
    });

    onMounted(() => {
      track.value?.shadowRoot?.addEventListener("slotchange", (e) => {
        track.value?.moveTo(0, "none");
      });
      updateOverflow();
    });

    const next = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth);
      track.value?.moveTo(
        Math.min(current.value + pageItemCount, itemCount.value - pageItemCount),
      );
    };

    const prev = () => {
      const itemWidth = (track.value?.children[0] as HTMLElement)?.offsetWidth;
      const pageItemCount = Math.round((track.value?.width || 0) / itemWidth) * -1;
      track.value?.moveBy(pageItemCount);
    };

    const updateOverflow = () => {
      overflowWidth.value = track.value?.overflowWidth || 0;
      itemCount.value = track.value?.children.length || 1;
      position.value = track.value?.position.x || 0;
      width.value = track.value?.trackWidth || 0;
    };

    return () => (
      <div
        class={twMerge("@container group relative w-full overflow-hidden", props.class)}
      >
        <div class="relative w-full">
          <button
            disabled={!showPrev.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 left-[12px] z-10 transform transition-all focus-visible:opacity-100 lg:block",
              showPrev.value ? "group-hover:opacity-100" : "opacity-0",
              "text-black dark:text-white",
            ]}
            onClick={prev}
            label="Previous page"
          >
            Previous
          </button>
          <button
            disabled={!showNext.value}
            class={[
              "-translate-y-1/2 absolute top-1/2 right-[12px] z-10 transform transition-all focus-visible:opacity-100 lg:block",
              showNext.value ? "group-hover:opacity-100" : "opacity-0",
              "text-black dark:text-white",
            ]}
            onClick={next}
            label="Next page"
          >
            Next
          </button>

          <a-track
            ref={track}
            class="flex w-full overflow-visible"
            overflowscroll
            snap
            onScroll={() => {
              position.value = track.value?.position.x || 0;
            }}
            onChange={() => {
              current.value = track.value?.currentItem || 0;
            }}
            onFormat={(e) => {
              updateOverflow();
            }}
          >
            {slots.default?.()}
          </a-track>
        </div>

        <div class="flex justify-center @lg:py-8 pt-5 pb-2">
          <div
            class={twMerge(
              "relative flex h-[2px] @lg:w-[400px] w-[200px] items-center bg-[rgba(255,255,255,30%)]",
              overflowWidth.value > 0 ? "opacity-100" : "opacity-0",
            )}
            style={{
              "--value": progress.value,
            }}
          >
            <div
              class={[
                "-top-[1px] absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px]",
                "rounded-md bg-white transition-none",
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
);

const SomeSlider = () => (
  <Slider>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/10/1200/1200" />
    </div>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/20/1200/1200" />
    </div>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/30/1200/1200" />
    </div>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/40/1200/1200" />
    </div>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/50/1200/1200" />
    </div>
    <div class="h-[500px] w-full flex-none box-border p-2">
      <img class="h-full w-full object-cover" src="https://picsum.photos/id/60/1200/1200" />
    </div>
  </Slider>
);

createApp(SomeSlider).mount('#root');
`;

export function Playground(props: {
  iframe?: string | HTMLIFrameElement;
}) {
  const iframe =
    (typeof props.iframe === "string"
      ? document.querySelector<HTMLIFrameElement>(props.iframe)
      : props.iframe) || document.createElement("iframe");

  iframe.src = "/atrium/story";

  console.info("init playground");

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

  async function pushCode(iframe: HTMLIFrameElement, value: string) {
    if (iframe.contentWindow) {
      iframe.contentWindow.location.reload();

      await new Promise((resolve) => {
        iframe.onload = resolve;
      });

      const script = document.createElement("script");
      script.type = "module";
      script.textContent = `import { h } from "vue";\n${(await transform(value)).code}`;
      console.debug(script.textContent);
      iframe.contentWindow.document.body.appendChild(script);
    }
  }

  window.MonacoEnvironment = {
    getWorkerUrl: (moduleId, label) => {
      if (label === "typescript") {
        return tsEditorWorker;
      }
      return editorWorker;
    },
  };

  async function init() {
    await import("@atrium-ui/layout");

    await esbuild.initialize({ wasmURL: esbuildUrl });

    const monaco: typeof import("monaco-editor") = await import(
      "monaco-editor/esm/vs/editor/editor.main.js"
    );

    customElements.define(
      "monaco-editor",
      class CodeViewMonaco extends HTMLElement {
        _monacoEditor;

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

          const model = monaco.editor.createModel(exampleCode.trim());
          monaco.editor.setModelLanguage(model, "typescript");
          this._monacoEditor.setModel(model);

          model.onDidChangeContent((event) => {
            pushCode(iframe, this._monacoEditor.getValue());
          });

          pushCode(iframe, this._monacoEditor.getValue());
        }
      },
    );
  }

  init();

  return (
    <div class="not-content">
      <a-layout>
        <a-layout-column>
          <a-layout-group>
            <monaco-editor />
          </a-layout-group>
        </a-layout-column>
        <a-layout-column>
          <a-layout-group>{!props.iframe ? iframe : null}</a-layout-group>
        </a-layout-column>
      </a-layout>
    </div>
  );
}
