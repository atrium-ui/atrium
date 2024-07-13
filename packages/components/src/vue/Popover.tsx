/* @jsxImportSource vue */
import "@sv/elements/popover";
import { Button } from "./Button";

export function Popover(props: { label?: string }, { slots }) {
  return (
    <a-popover class="relative z-10">
      {/* @ts-ignore */}
      <div slot="input">
        {props.label ? (
          <Button slot="input" variant="outline">
            {props.label}
          </Button>
        ) : (
          slots.input?.()
        )}
      </div>

      <a-popover-portal class="group">
        <div class="w-[max-content] py-1">
          <div
            class={[
              "min-w-[100px] rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800",
              // "scale-95 opacity-0 group-[&[enabled]]:scale-100 group-[&[enabled]]:opacity-100",
            ]}
          >
            {slots.default?.()}
          </div>
        </div>
      </a-popover-portal>
    </a-popover>
  );
}
