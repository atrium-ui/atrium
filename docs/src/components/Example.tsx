/* @jsxImportSource vue */

import { twMerge } from "tailwind-merge";
import { defineComponent, ref } from "vue";

export const ExamplePreview = defineComponent((props, { slots }) => {
  const open = ref(false);

  return () => (
    <div>
      <div class="absolute bottom-0 left-full">
        <div class="flex flex-col gap-module-xl px-[1.75rem] py-2">
          <button
            type="button"
            class="button-icon"
            onClick={() => {
              open.value = !open.value;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="#000000"
              viewBox="0 0 256 256"
            >
              <title>Toggle Code</title>
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z" />
            </svg>
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
        <div class="relative z-10 overflow-clip rounded-xl bg-[#24292F] text-white">
          <div class="sticky top-0 bg-[#3A3A43] p-2">Code view</div>
          {/* contenteditable scopes ctrl+a to this box */}
          <div contenteditable>{slots.default?.()}</div>
        </div>
      </a-blur>
    </div>
  );
});
