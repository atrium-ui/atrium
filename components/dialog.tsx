import '@sv/elements/blur';

interface Props {
  children?: JSX.Element | string;
}

export default function Button(props: Props, context) {
  const slots = {
    default: () =>
      props.children ? props.children : context?.slots?.default ? context?.slots.default() : null,
  };

  return (
    <a-blur
      class="group/blur block fixed z-50 top-0 left-0 w-full h-full transition-all
           [&[enabled]]:bg-[#33333333] [&[enabled]]:backdrop-blur-md"
    >
      <div
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                min-w-[400px] py-8 px-8 rounded-lg bg-zinc-800 border border-zinc-700
                transition-all scale-95 group-[&[enabled]]/blur:scale-100
                opacity-0 group-[&[enabled]]/blur:opacity-100
                group-[&[enabled]]/blur:block"
      >
        <slots.default />
      </div>
    </a-blur>
  );
}
