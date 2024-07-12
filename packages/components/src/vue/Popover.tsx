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

      <a-popover-portal>
        <div class="w-[max-content] py-1">
          <div class="min-w-[100px] rounded-md border border-zinc-700 bg-zinc-50 p-1 px-3 dark:bg-zinc-800">
            {slots.default?.()}
          </div>
        </div>
      </a-popover-portal>
    </a-popover>
  );
}
