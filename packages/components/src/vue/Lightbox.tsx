/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import "@svp/elements/blur";
import { Button } from "./Button";
import { Icon } from "./Icon";

export const Lightbox = defineComponent((_, { slots }) => {
  const open = ref(false);

  return () => (
    <div>
      <Button
        onClick={() => {
          open.value = true;
        }}
      >
        Open
      </Button>

      {/* should eventually use native <dialog /> */}
      <a-blur
        enabled={open.value || undefined}
        class={[
          "group/dialog fixed top-0 left-0 z-50 block h-full w-full opacity-0 transition-all",
          "[&[enabled]]:bg-[#33333333] [&[enabled]]:opacity-100 [&[enabled]]:backdrop-blur-md",
        ]}
        onBlur={() => {
          open.value = false;
        }}
      >
        <div
          class={[
            "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px] transition-all",
            "scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100",
          ]}
        >
          {slots.default?.()}
        </div>

        <div class="absolute top-20 right-20 z-50 text-2xl">
          <Button
            label="close"
            variant="ghost"
            onClick={() => {
              open.value = false;
            }}
          >
            <Icon name="close" />
          </Button>
        </div>
      </a-blur>
    </div>
  );
});
