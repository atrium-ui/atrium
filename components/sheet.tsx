import '@atrium-ui/mono/blur';

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
        class="fixed top-0 left-full h-full bg-zinc-800 transition-all
               group-[&[enabled]]/blur:-translate-x-full py-32 px-4
               w-full sm:w-96"
      >
        <slots.default />
      </div>
    </a-blur>
  );
}
