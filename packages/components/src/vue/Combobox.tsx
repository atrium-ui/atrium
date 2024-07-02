/* @jsxImportSource vue */
import "@sv/elements/select";
import "@sv/elements/toggle";
import "@sv/elements/expandable";

import { Icon } from "./Icon.jsx";
import { Input } from "./Input.jsx";

export function Combobox(
  props: {
    onChange?: (value: string[]) => void;
    value: string[];
  },
  { slots },
) {
  return (
    <a-select
      selected={props.value}
      class="relative inline-block"
      onInput={(e) => {
        props.onChange?.(e.target?.value as string[]);
      }}
    >
      <div slot="input">
        <Input>
          <div class="w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {Array.isArray(props.value)
              ? props.value?.length > 0
                ? props.value?.join(", ")
                : "Select"
              : props.value}
          </div>
        </Input>
      </div>

      <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
        <a-toggle multiple>{slots.default?.()}</a-toggle>
      </div>
    </a-select>
  );
}

export function ComboboxItem(props: { selected: boolean; value: string }) {
  return (
    <button
      type="button"
      aria-selected={props.selected || undefined}
      value={props.value}
      class="group flex w-full cursor-pointer items-center justify-start rounded-md bg-transparent active:bg-zinc-700 hover:bg-zinc-600"
    >
      <div class="mr-2 ml-1 opacity-0 group-[&[aria-selected]]:opacity-100">
        <Icon name="check" />
      </div>
      <div>{props.value}</div>
    </button>
  );
}
