import "@sv/elements/dropdown";
import "@sv/elements/toggle";
import "@sv/elements/expandable";

import { Button } from "./button.jsx";

function CheckIcon() {
  return (
    <svg
      class="block stroke-current"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      viewBox="0 0 17.121 13.141"
    >
      <title>Checkmark</title>
      <path
        d="M683,754.437l5.041,5.041L698,749.518"
        transform="translate(-681.939 -748.457)"
        fill="none"
        stroke-width="3"
      />
    </svg>
  );
}

export function Combobox(
  props: {
    children?: JSX.Element | string;
    value: string;
  },
  context,
) {
  const slots = {
    default: () =>
      props.children
        ? props.children
        : context?.slots?.default
          ? context?.slots.default()
          : null,
  };

  return (
    <div onInput={(e) => console.info(e.target.value)}>
      <a-dropdown class="relative inline-block">
        <Button slot="input" class="w-[150px]">
          {props.value}
        </Button>

        <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-800 p-1">
          <a-toggle multiple>
            <slots.default />
          </a-toggle>
        </div>
      </a-dropdown>
    </div>
  );
}

Combobox.Item = function Item(props: { value: string }) {
  return (
    <button
      type="button"
      value={props.value}
      class="group flex w-full cursor-pointer items-center justify-start rounded-md bg-transparent active:bg-zinc-700 hover:bg-zinc-600"
    >
      <div class="mr-2 ml-1 opacity-0 group-[&[selected]]:opacity-100">
        <CheckIcon />
      </div>
      <div>{props.value}</div>
    </button>
  );
};
