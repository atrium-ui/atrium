/* @jsx React */
import type { PropsWithChildren } from "react";
import { Button } from "./Button";
import "@sv/elements/popover";

export function Popover(props: { label?: string } & PropsWithChildren) {
  return (
    // @ts-ignore
    <a-popover-trigger class="relative z-10">
      <div slot="trigger">
        <Button slot="trigger" variant="outline">
          {props.label}
        </Button>
      </div>

      {/* @ts-ignore */}
      <a-popover class="group">
        <div
          className={[
            "w-[max-content] p-2",
            "opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100",
          ].join(" ")}
        >
          <div
            className={[
              "min-w-[100px] rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800",
              "scale-95 transition-all duration-150 group-[&[enabled]]:scale-100",
            ].join(" ")}
          >
            {props.children}
          </div>
        </div>
        {/* @ts-ignore */}
      </a-popover>
      {/* @ts-ignore */}
    </a-popover-trigger>
  );
}
