/* @jsxImportSource vue */

import "@sv/elements/dropdown";
import "@sv/elements/toggle";
import "@sv/elements/expandable";

import { Button } from "./Button.jsx";
import { Icon } from "./Icon.jsx";

export function Combobox(
  props: {
    value: string;
  },
  { slots },
) {
  return (
    // @ts-ignore
    <div onInput={(e) => console.info(e.target.value)}>
      <a-dropdown class="relative inline-block">
        <Button slot="input">
          <div class="w-[150px] text-left">{props.value}</div>
        </Button>

        <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
          <a-toggle multiple>{slots.default?.()}</a-toggle>
        </div>
      </a-dropdown>
    </div>
  );
}

Combobox.Item = function Item(props: { value: string }) {
  return (
    <button
      type="button"
      value={props.value}
      class="group flex w-full cursor-pointer items-center justify-start rounded-md bg-transparent active:bg-zinc-700 hover:bg-zinc-600"
    >
      <div class="mr-2 ml-1 opacity-0 group-[&[selected]]:opacity-100">
        <Icon name="check" />
      </div>
      <div>{props.value}</div>
    </button>
  );
};
