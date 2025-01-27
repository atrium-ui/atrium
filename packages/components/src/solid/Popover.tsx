/* @jsxImportSource solis-js */
import type { ParentProps } from "solid-js";
import { Button } from "./Button";
import "@atrium-ui/elements/popover";

export function Popover(props: { label?: string } & ParentProps) {
  return (
    <a-popover-trigger class="relative z-10">
      <div slot="trigger">
        <Button slot="trigger" variant="outline">
          {props.label}
        </Button>
      </div>

      <a-popover class="group">
        <div
          class={[
            "w-[max-content] p-2",
            "opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100",
          ].join(" ")}
        >
          <div
            class={[
              "min-w-[100px] rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800",
              "scale-95 transition-all duration-150 group-[&[enabled]]:scale-100",
            ].join(" ")}
          >
            {props.children}
          </div>
        </div>
      </a-popover>
    </a-popover-trigger>
  );
}
