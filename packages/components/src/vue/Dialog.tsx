/* @jsxImportSource vue */
import { defineComponent, ref } from "vue";
import "@sv/elements/blur";
import "@sv/elements/portal";
import { Button } from "./Button.js";

export const Dialog = defineComponent(
  (props: { label?: string; class?: string }, { slots }) => {
    const open = ref(false);

    return () => (
      <div>
        <Button
          class={props.class}
          onClick={() => {
            open.value = true;
          }}
        >
          {props.label}
        </Button>

        <a-portal>
          <a-blur
            enabled={open.value || undefined}
            class="group/dialog fixed top-0 left-0 z-50 block h-full w-full [&[enabled]]:bg-[#00000010] transition-colors"
            onExit={() => {
              open.value = false;
            }}
          >
            <div
              class={[
                "rounded-lg border px-8 py-8 opacity-0 transition-all",
                "border-zinc-200 bg-zinc-50",
                "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px]",
                "scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100 group-[&[enabled]]/dialog:opacity-100",
              ]}
            >
              {slots.default?.()}
            </div>
          </a-blur>
        </a-portal>
      </div>
    );
  },
  {
    props: ["label", "class"],
  },
);
