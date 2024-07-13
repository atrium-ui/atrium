/* @jsxImportSource vue */
import "@sv/elements/popover";
import { Button } from "./Button";

export function Popover(props: { label?: string }, { slots }) {
  return (
    <a-popover-trigger class="relative z-10">
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

      <a-popover class="group">
        <div
          class={[
            "w-[max-content] p-2",
            "opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100",
          ]}
        >
          <div
            class={[
              "min-w-[100px] rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800",
              "scale-95 transition-all duration-150 group-[&[enabled]]:scale-100",
            ]}
          >
            {slots.default?.()}
          </div>
        </div>
      </a-popover>
    </a-popover-trigger>
  );
}
