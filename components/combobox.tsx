import '@atrium-ui/dropdown';
import '@atrium-ui/toggle';

function CheckIcon() {
  return (
    <svg
      class="stroke-current block"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      viewBox="0 0 17.121 13.141"
    >
      <path
        d="M683,754.437l5.041,5.041L698,749.518"
        transform="translate(-681.939 -748.457)"
        fill="none"
        stroke-width="3"
      />
    </svg>
  );
}

function Item(props: { value: string }) {
  return (
    <button
      type="button"
      value={props.value}
      class="group cursor-pointer w-full flex items-center justify-start
            rounded-md bg-transparent hover:bg-zinc-600 active:bg-zinc-700"
    >
      <div class="opacity-0 group-[&[selected]]:opacity-100 ml-1 mr-2">
        <CheckIcon />
      </div>
      <div>{props.value}</div>
    </button>
  );
}

export default function Combobox(props: {
  value: string;
}) {
  return (
    <div onInput={(e) => console.log(e.target.value)}>
      <a-dropdown class="relative inline-block">
        <button
          type="button"
          slot="input"
          class="cursor-pointer rounded-lg bg-[#C09278] px-4 py-1
              active:bg-[rgba(158,118,96,1)] text-left min-w-[150px]"
        >
          {props.value}
        </button>

        <div class="rounded-md bg-zinc-800 border border-zinc-700 p-1 mt-1">
          <a-toggle multiple>
            <Item value="item1" />
            <Item value="item2" />
            <Item value="item3" />
          </a-toggle>
        </div>
      </a-dropdown>
    </div>
  );
}
