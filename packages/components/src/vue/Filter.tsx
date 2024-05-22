/* @jsxImportSource vue */

import "@svp/elements/dropdown";
import "@svp/elements/expandable";

interface Props {
  value: string;
}

export function Filter(props: Props, { slots }) {
  return (
    <div
      // @ts-ignore
      onInput={(e) => console.info(e.target?.value)}
      class="rounded-lg border border-zinc-700 bg-zinc-800 p-1"
    >
      <a-dropdown class="block" style="--dropdown-position: static;">
        <input
          // @ts-ignore
          slot="input"
          class="min-w-[500px] rounded-md bg-transparent px-3 py-1 text-left outline-none"
          // onInput="handleFilter"
          placeholder="Type to filter..."
          value={props.value}
        />

        <div class="max-h-[200px] p-1">{slots.default?.()}</div>
      </a-dropdown>
    </div>
  );
}

Filter.Item = function Item(props: { value: string }) {
  return (
    <a-option
      class="rounded-md [&[selected]]:bg-zinc-700 active:bg-zinc-700 hover:bg-zinc-600"
      value={props.value}
    >
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center justify-start bg-transparent"
      >
        <div>{props.value}</div>
      </button>
    </a-option>
  );
};
