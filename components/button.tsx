// copy pasteable ui component
// import "@atrium-ui/mono/components/dropdown";

const variants = {
  outline: 'rounded-lg border border-[#C09278] px-6 py-2 bg-transparent',
  solid: 'rounded-lg bg-[#C09278] px-6 py-2',
  ghost: 'p-2 flex items-center gap-2 text-2xl hover:text-[#C09278]',
};

interface Props {
  children?: JSX.Element | string;
  variant?: keyof typeof variants;
}

// adapter pattern to be useable in vue, solid, and react components

// TODO: shouldnt destruct props because of solid js compat
export default function Button({ children, variant }: Props, context) {
  const slots = {
    default: () =>
      children ? children : context?.slots?.default ? context?.slots.default() : null,
  };

  return (
    <button type="button" class={variants[variant ?? 'solid']}>
      <slots.default />
    </button>
  );
}
