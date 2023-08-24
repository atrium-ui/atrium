// copy pasteable ui component
// import "@atrium-ui/mono/components/dropdown";

const style = `
  inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
  border border-input hover:bg-accent hover:text-accent-foreground
  h-10 py-2 px-4
`;

interface Props {
  children?: JSX.Element | string;
}

// adapter pattern to be useable in vue, solid, and react components
export default function Button({ children }: Props, context) {
  const slots = {
    default: () =>
      children ?? context.slots.default ? (context.slots.default() as JSX.Element) : null,
  };

  return (
    <button class={style}>
      <div>
        <slots.default />
      </div>
    </button>
  );
}
