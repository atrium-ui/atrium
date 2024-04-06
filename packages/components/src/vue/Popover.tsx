/* @jsxImportSource vue */

import "@sv/elements/popover";

import { Button } from "./Button.jsx";

export function Popover(
  props: {
    label: string;
  },
  { slots },
) {
  return (
    <a-popover class="group relative z-10">
      <Button slot="input">{props.label}</Button>

      <div class="absolute py-1">
        <div
          class={[
            "w-80 rounded-md border border-zinc-700 bg-zinc-800 p-4 transition-all duration-100",
            "scale-95 opacity-0 group-[&[opened]]:scale-100 group-[&[opened]]:opacity-100",
          ]}
        >
          {slots.default?.()}
        </div>
      </div>
    </a-popover>
  );
}
