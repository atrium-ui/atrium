/* @jsxImportSource vue */

import { twMerge } from "tailwind-merge";
import { defineComponent, ref } from "vue";
import "@sv/svg-sprites/svg-icon";
import { elementToSVG } from "dom-to-svg";

function copySVG(target: HTMLElement) {
  const svgDocument = elementToSVG(target);
  return new XMLSerializer().serializeToString(svgDocument);
}

export const ExamplePreview = defineComponent((props, { slots }) => {
  const open = ref(false);

  document.body.classList.add("hydrated");

  return () => (
    <div>
      <div class="absolute bottom-0 left-full">
        <div class="flex flex-col gap-module-xl px-[1.75rem] py-2">
          <button
            type="button"
            class="button-icon"
            onClick={(e) => {
              const ele = e.target?.closest(".relative")?.querySelector(".not-content");
              const str = copySVG(ele);

              navigator.clipboard
                .write([new ClipboardItem({ "text/plain": str || "" })])
                .then(() => {
                  showToast("Copied to clipboard");
                });
            }}
          >
            <svg-icon class="block" use="svg" />
          </button>

          <button
            type="button"
            class="button-icon"
            onClick={() => {
              open.value = !open.value;
            }}
          >
            <svg-icon class="block" use="code" />
          </button>
        </div>
      </div>

      <a-blur
        enabled={open.value || undefined}
        onExit={() => {
          open.value = false;
        }}
        class={twMerge(
          "-right-[10px] absolute top-0 z-10 my-4 max-h-full w-full max-w-[60%] overflow-auto rounded-lg bg-white opacity-0 shadow-xl [&[enabled]]:opacity-100",
          "after:fixed after:top-0 after:left-0 after:h-full after:w-full",
        )}
      >
        <div class="relative z-10 overflow-clip rounded-lg bg-[#24292F] text-white">
          <div class="sticky top-0 bg-[#3A3A43] p-2">Code view</div>
          {/* contenteditable scopes ctrl+a to this box */}
          <div contenteditable>{slots.default?.()}</div>
        </div>
      </a-blur>
    </div>
  );
});
