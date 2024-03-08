import "@sv/elements/toggle";
import "@sv/elements/track";

interface Props {
  children?: JSX.Element | string;
}

function Dot() {
  return (
    <button
      type="button"
      class="h-4 w-4 cursor-pointer rounded-full bg-zinc-400 [&[selected]]:bg-white"
    />
  );
}

export function Slider(props: Props, context) {
  const slots = {
    default: () =>
      props.children
        ? props.children
        : context?.slots?.default
          ? context?.slots.default()
          : null,
  };

  return (
    <div>
      <a-track snap class="flex w-full">
        <slots.default />
      </a-track>

      <a-toggle
        class="mt-4 flex justify-center gap-2"
        onchange={(e) => {
          console.info(e);
        }}
      >
        <Dot />
        <Dot />
        <Dot />
      </a-toggle>
    </div>
  );
}
