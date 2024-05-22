/* @jsxImportSource vue */

import "@sv/elements/blur";

interface Props {
  enabled?: boolean | undefined;
}

export function Sheet(props: Props, { slots }) {
  return (
    <a-blur
      enabled={props?.enabled}
      class="group/blur fixed top-0 left-0 z-50 block h-full w-full transition-all [&[enabled]]:bg-[#33333333]"
    >
      <div class="group-[&[enabled]]/blur:-translate-x-full fixed top-0 left-full h-full w-full overflow-auto bg-zinc-800 px-4 py-32 transition-all sm:w-96">
        {slots.default?.()}
      </div>
    </a-blur>
  );
}
