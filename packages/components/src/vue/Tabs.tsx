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
                <item
                  active={active.value === i}
                  onClick={() => {
                    active.value = i;
                    props.onChange?.(i);
                  }}
                  key={`tab_${i}`}
                />
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

export const TabItem = defineComponent(
  (props: { active?: boolean; onClick?: () => void }, { slots }) => {
    return () => (
      <li>
        <Button
          variant="ghost"
          class={twMerge(
            "whitespace-nowrap rounded-lg bg-transparent",
            props.active ? "bg-zinc-700 text-white" : "",
          )}
          onClick={() => props.onClick?.()}
        >
          {slots.default?.()}
        </Button>
      </li>
    );
  },
  {
    props: ["active", "onClick"],
  },
);
