/* @jsxImportSource vue */

import "@sv/elements/toggle";
import "@sv/elements/track";

function Dot() {
  return (
    <button
      type="button"
      class="h-4 w-4 cursor-pointer rounded-full bg-zinc-400 [&[selected]]:bg-white"
    />
  );
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type Props = {};

export function Slider(props: Props, { slots }) {
  return (
    <div>
      <a-track snap class="flex w-full">
        {slots.default?.()}
      </a-track>

      <a-toggle class="mt-4 flex justify-center gap-2">
        <Dot />
        <Dot />
        <Dot />
      </a-toggle>
    </div>
  );
}
