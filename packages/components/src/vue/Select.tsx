/* @jsxImportSource vue */
import "@sv/elements/dropdown";
import "@sv/elements/expandable";

import { Button } from "./Button.jsx";

export function Select(
  props: {
    value: string;
  },
  { slots },
) {
  return (
    <div onSelect={(e: any) => console.info(e.option?.value)}>
      <a-dropdown class="relative inline-block">
        <Button slot="input">
          <div class="w-[150px] text-left">{props.value}</div>
        </Button>

        <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
          {slots.default?.()}
        </div>
      </a-dropdown>
    </div>
  );
}

Select.Item = function Item(props: { value: string }) {
  return (
    <a-option
      class="rounded-md [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600"
      value={props.value}
    >
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center justify-start bg-transparent"
      >
        <div>{props.value}</div>
      </button>
    </a-option>
  );
};
