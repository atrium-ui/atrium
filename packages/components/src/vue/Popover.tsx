/* @jsxImportSource vue */
import "@sv/elements/popover";
import { Button } from "./Button";

export function Popover(props: { label?: string }, { slots }) {
  return (
    <a-popover class="group relative z-10">
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

      <div class="absolute py-1">
        <div
          class={[
            "min-w-[100px] rounded-md border border-zinc-700 bg-zinc-800 p-2 transition-all duration-100",
            "scale-95 opacity-0 group-[&[opened]]:scale-100 group-[&[opened]]:opacity-100",
          ]}
        >
          {slots.default?.()}
        </div>
      </div>
    </a-popover>
  );
}
