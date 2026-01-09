/* @jsxImportSource vue */
import { twJoin } from "tailwind-merge";

export function Pager(
  props: {
  },
  context,
) {
  return (
    <div>
      {context?.slots.default?.()}
    </div>
  );
}
