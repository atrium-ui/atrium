/* @jsxImportSource vue */
import "@atrium-ui/elements/select";
import "@atrium-ui/elements/expandable";
import { Button } from "./Button.jsx";
import { defineComponent, ref } from "vue";
import { twMerge } from "tailwind-merge";

export const Select = defineComponent(
  (
    props: {
      name: string;
      placeholder: string;
      label?: string;
      value?: string;
      required?: boolean;
      onSelect?: (e: CustomEvent) => void;
    },
    { slots },
  ) => {
    const value = ref(props.value);

    return () => (
      <div>
        {props.label && (
          <div class="pb-1 text-sm">
            <label for={props.name}>{props.label}</label>
          </div>
        )}

        <a-select
          required={props.required}
          value={value.value}
          name={props.name}
          onChange={(ev) => {
            value.value = ev.target?.value;
          }}
          class="relative inline-block w-full"
        >
          <Button class="w-full" slot="trigger" aria-label={props.label}>
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
    props: ["value", "placeholder", "required", "name", "onSelect", "label"],
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
        "hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200",
        "dark:active:bg-zinc-700 dark:hover:bg-zinc-600 dark:[&[selected]]:bg-zinc-700",
        props.class,
      )}
      value={props.value}
    >
      <div>{slots.default?.() || props.value}</div>
    </a-option>
  );
};
