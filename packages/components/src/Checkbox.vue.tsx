/* @jsxImportSource vue */

import "@sv/elements/toggle";

function CheckIcon() {
  return (
    <svg
      class="block stroke-current"
      xmlns="http://www.w3.org/2000/svg"
      width="17.121"
      height="13.141"
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

interface Props {
  id: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
}

export function Checkbox(props: Props, { slots }) {
  return (
    <div class="grid grid-cols-[auto_auto] gap-3">
      <a-toggle onInput={props.onChange} active-attribute="data-selected">
        {/* TODO: there should be an actual input here for form compatibility */}
        <button
          type="button"
          class="group h-7 w-7 cursor-pointer rounded-md border border-zinc-700 bg-transparent p-0 hover:border-zinc-600"
          id={props.id}
          data-selected={props.checked}
        >
          <div class="hidden items-center justify-center group-[&[data-selected]]:flex">
            <CheckIcon />
          </div>
        </button>
      </a-toggle>

      <div>
        <label for={props.id} class="cursor-pointer text-lg">
          {slots.default?.()}
        </label>
      </div>
    </div>
  );
}