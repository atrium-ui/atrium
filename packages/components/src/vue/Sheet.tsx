/* @jsxImportSource vue */
import "@sv/elements/portal";
import "@sv/elements/blur";

interface Props {
  enabled?: boolean | undefined;
}

export function Sheet(props: Props, { slots }) {
  return (
    <a-portal>
      <a-blur
        scrolllock
        enabled={props?.enabled}
        class="group/blur fixed top-0 left-0 block h-full w-full transition-all [&[enabled]]:bg-[#33333333]"
      >
        <div
          class={[
            "group-[&[enabled]]/blur:-translate-x-full absolute top-0 left-full h-full w-full overflow-auto px-4 py-12 transition-all sm:w-96",
            "bg-zinc-100",
          ]}
        >
          {slots.default?.()}
        </div>
      </a-blur>
    </a-portal>
  );
}
