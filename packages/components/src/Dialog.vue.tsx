/* @jsxImportSource vue */

import "@sv/elements/blur";

interface Props {
  enabled: boolean;
}

export function Dialog(props: Props, { slots }) {
  return (
    <a-blur
      enabled={props.enabled || undefined}
      class="group/blur fixed top-0 left-0 z-50 block h-full w-full transition-all [&[enabled]]:bg-[#33333333] [&[enabled]]:backdrop-blur-md"
    >
      <div class="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px] scale-95 rounded-lg border border-zinc-700 bg-zinc-800 px-8 py-8 opacity-0 transition-all group-[&[enabled]]/blur:block group-[&[enabled]]/blur:scale-100 group-[&[enabled]]/blur:opacity-100">
        {slots.default?.()}
      </div>
    </a-blur>
  );
}
