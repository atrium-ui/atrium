/* @jsxImportSource vue */
import { defineComponent, ref } from "vue";
import "@sv/elements/blur";
import "@sv/elements/portal";
import { Button } from "./Button";

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
            class={[
              "group/dialog fixed top-0 left-0 z-50 block h-full w-full transition-all",
              "[&[enabled]]:bg-[#00000033]",
            ]}
            onExit={() => {
              open.value = false;
            }}
          >
            <div
              class={[
                "rounded-lg border px-8 py-8 opacity-0 transition-all",
                "border-zinc-700 bg-zinc-50 dark:bg-zinc-900",
                "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px]",
                "scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100 group-[&[enabled]]/dialog:opacity-100",
              ]}
            >
              {slots.default?.()}

              <div class="mt-4">
                <Button
                  onClick={() => {
                    open.value = false;
                  }}
                >
                  Close
                </Button>
              </div>
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
