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

      <a-popover-content>
        <a-blur class="scale-95 py-1 opacity-0 transition-all duration-100 [&[enabled]]:scale-100 [&[enabled]]:opacity-100">
          <div
            class={[
              "min-w-[100px] rounded-md border p-2",
              "border-zinc-700 bg-zinc-50 dark:bg-zinc-800",
            ]}
          >
            {slots.default?.()}
          </div>
        </a-blur>
      </a-popover-content>
    </a-popover>
  );
}
