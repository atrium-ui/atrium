/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import "@sv/elements/toggle";
import { Icon } from "./Icon";

interface Props {
  id: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
}

export const Checkbox = defineComponent(
  (props: Props, { slots }) => {
    const checked = ref(props.checked);

    return () => (
      <div class="grid grid-cols-[auto_1fr] gap-3">
        <button
          type="button"
          onClick={() => {
            checked.value = !checked.value;
          }}
          class="group mt-1 h-6 w-6 cursor-pointer rounded-md border border-zinc-700 bg-transparent p-0 hover:border-zinc-600"
        >
          <div class={["flex items-center justify-center", !checked.value && "hidden"]}>
            <Icon name="check" />
          </div>
        </button>

        <input
          type="checkbox"
          class="hidden"
          id={props.id}
          name={props.id}
          checked={checked.value}
        />

        <label for={props.id} class="cursor-pointer text-lg">
          {slots.default?.()}
        </label>
      </div>
    );
  },
  {
    props: ["checked", "id", "onChange"],
  },
);
