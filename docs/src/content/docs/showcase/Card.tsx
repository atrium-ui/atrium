/* @jsxImportSource vue */

import { Button } from "@components/src/vue/Button";
import { Icon } from "@components/src/vue/Icon";
import { toast } from "@components/src/vue/Toasts";
import { twMerge } from "tailwind-merge";
import { ref } from "vue";

export function Card(props: { class?: string }, { slots }) {
  const inner = ref<HTMLDivElement>();
  return (
    <div
      class={twMerge(
        "group relative rounded-lg border shadow-md dark:border-zinc-950 dark:bg-slate-800",
      )}
    >
      <div
        class={twMerge([
          "-top-[12px] -right-[12px] absolute z-20 p-2",
          "text-white",
          "opacity-0 hover:opacity-75",
        ])}
      >
        <Button
          variant="ghost"
          label="Copy HTML"
          class="bg-zinc-800 py-3"
          onClick={() => {
            const html = inner.value?.outerHTML;
            if (html) {
              const type = "text/plain";
              const blob = new Blob([html], { type });
              const data = [new ClipboardItem({ [type]: blob })];

              navigator.clipboard.write(data).then(() => {
                toast({
                  id: "copy",
                  variant: "transparent",
                  time: 4000,
                  message: "Copied to clipboard",
                });
              });
            }
          }}
        >
          <Icon name="clipboard" />
        </Button>
      </div>

      <div class={twMerge("relative overflow-hidden", props.class)} ref={inner}>
        {slots.default?.()}
      </div>
    </div>
  );
}
