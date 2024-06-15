/* @jsxImportSource vue */
import "@sv/elements/track";
import { Button } from "./Button";
import { twMerge } from "tailwind-merge";
import { defineComponent, ref, effect } from "vue";

export const Tabs = defineComponent(
  (
    props: {
      active: number;
      onChange?: (tab: number) => void;
    },
    { slots },
  ) => {
    const active = ref<number>(props.active);

    effect(() => {
      active.value = props.active;
    });

    return () => (
      <div class="w-full rounded-lg bg-zinc-800 p-1">
        <a-track overflowscroll>
          <ul class="flex list-none gap-1 p-0">
            {slots.default?.()?.map((item, i) => {
              return (
                <li key={`tab_${i}`}>
                  <Button
                    variant="ghost"
                    class={twMerge(
                      "whitespace-nowrap rounded-lg bg-transparent",
                      active.value === i ? "bg-zinc-700 text-white" : "",
                    )}
                    onClick={() => {
                      active.value = i;
                      props.onChange?.(i);
                    }}
                  >
                    {item}
                  </Button>
                </li>
              );
            })}
          </ul>
        </a-track>
      </div>
    );
  },
  {
    props: ["active", "onChange"],
  },
);

export const TabItem = defineComponent((_, { slots }) => {
  return () => slots.default?.();
});
