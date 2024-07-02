/* @jsxImportSource vue */
import "@sv/elements/dropdown";
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
          onSelect={async (ev) => {
            value.value = ev.option?.value;
          }}
          class="relative inline-block w-full"
        >
          <Button class="w-full" slot="input">
            <div class="min-w-[150px] text-left">{value.value || props.placeholder}</div>
          </Button>

          <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
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
        "block cursor-pointer rounded-md px-1 [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600",
        props.class,
      )}
      value={props.value}
    >
      <div>{slots.default?.() || props.value}</div>
    </a-option>
  );
};
