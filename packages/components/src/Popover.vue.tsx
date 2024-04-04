/* @jsxImportSource vue */

import "@sv/elements/popover";

import { Button } from "./Button.vue.jsx";

export function Popover(
  props: {
    label: string;
  },
  { slots },
) {
  return (
    <a-popover class="group relative z-10">
      <Button slot="input">{props.label}</Button>

      <div class="mt-1 w-80 rounded-md border border-zinc-700 bg-zinc-800 p-4 opacity-0 transition-all group-[&[opened]]:opacity-100">
        {slots.default?.()}
      </div>
    </a-popover>
  );
}
