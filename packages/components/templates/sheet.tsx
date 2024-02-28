import "@sv/elements/blur";

interface Props {
  children?: JSX.Element | string;
  enabled?: boolean | undefined;
}

export function Sheet(props: Props, context) {
  const slots = {
    default: () =>
      props.children
        ? props.children
        : context?.slots?.default
          ? context?.slots.default()
          : null,
  };

  return (
    <a-blur
      enabled={props?.enabled}
      class="group/blur block fixed z-50 top-0 left-0 w-full h-full transition-all
           [&[enabled]]:bg-[#33333333]"
    >
      <div
        class="fixed top-0 left-full h-full bg-zinc-800 overflow-auto transition-all
               group-[&[enabled]]/blur:-translate-x-full py-32 px-4
               w-full sm:w-96"
      >
        <slots.default />
      </div>
    </a-blur>
  );
}
