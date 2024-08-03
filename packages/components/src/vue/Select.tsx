/* @jsxImportSource vue */
import "@sv/elements/select";
import "@sv/elements/expandable";
import { Button } from "./Button.jsx";
import { defineComponent, ref } from "vue";
import { twMerge } from "tailwind-merge";

export const Select = defineComponent(
  (
    props: {
      name: string;
      placeholder: string;
      value?: string;
      required?: boolean;
      onSelect?: (e: CustomEvent) => void;
    },
    { slots },
  ) => {
    const value = ref(props.value);

    return () => (
      <div>
        <a-select
          required={props.required}
          value={value.value}
          name={props.name}
          onChange={(ev) => {
            value.value = ev.target?.value;
          }}
          class="relative inline-block w-full"
        >
          <Button class="w-full" slot="trigger">
            <div class="min-w-[150px] text-left">{value.value || props.placeholder}</div>
          </Button>

          <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800">
            {slots.default?.()}
          </div>
        </a-select>
      </div>
    );
  },
  {
    props: ["value", "placeholder", "required", "name", "onSelect"],
  },
);

export const SelectItem = function Item(
  props: { value: string; class?: string },
  { slots },
) {
  return (
    <a-option
      class={twMerge(
        "block cursor-pointer rounded px-2",
        "[&[selected]]:bg-zinc-200 active:bg-zinc-200 hover:bg-zinc-100",
        "dark:[&[selected]]:bg-zinc-700 dark:active:bg-zinc-700 dark:hover:bg-zinc-600",
        props.class,
      )}
      value={props.value}
    >
      <div>{slots.default?.() || props.value}</div>
    </a-option>
  );
};
