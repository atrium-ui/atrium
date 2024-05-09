/* @jsxImportSource vue */

import "@sv/elements/dropdown";
import "@sv/elements/toggle";
import "@sv/elements/expandable";

import { Button } from "./Button.jsx";
import { Icon } from "./Icon.jsx";

export function Combobox(
  props: {
    onChange: (value: string[]) => void;
    value: string[];
  },
  { slots },
) {
  return (
    <a-dropdown
      selected={props.value}
      class="relative inline-block"
      onInput={(e) => {
        props.onChange(e.target?.value as string[]);
      }}
    >
      <Button variant="outline" slot="input">
        <div class="w-[150px] text-left overflow-hidden whitespace-nowrap text-ellipsis">
          {props.value.length > 0 ? props.value.join(", ") : "Select"}
        </div>
      </Button>

      <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
        <a-toggle multiple>{slots.default?.()}</a-toggle>
      </div>
    </a-dropdown>
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
