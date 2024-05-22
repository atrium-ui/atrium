/* @jsxImportSource vue */

import { defineComponent, ref } from "vue";
import "@svp/elements/toggle";
import { Icon } from "./Icon";

interface Props {
  id: string;
  checked?: boolean;
  onChange?: (event: Event) => void;
}

// TODO: most of this can be a custom element
export const Checkbox = defineComponent(
  (props: Props, { slots }) => {
    const checked = ref(props.checked);
    const input = ref<HTMLInputElement>();

    const handleChange = (value: boolean) => {
      checked.value = value;
      if (input.value) {
        input.value.checked = value;
        input.value.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    return () => (
      <div class="flex items-start gap-3">
        <button
          role="checkbox"
          aria-checked={checked.value}
          type="button"
          aria-labelledby={`label_${props.id}`}
          onClick={() => handleChange(!checked.value)}
          class="mt-[2px] h-6 w-6 cursor-pointer rounded-md border border-zinc-700 bg-transparent p-0 align-bottom hover:border-zinc-600"
        >
          <div
            aria-hidden="true"
            class={["flex items-center justify-center", !checked.value && "hidden"]}
          >
            <Icon name="check" />
          </div>
        </button>

        <input
          ref={input}
          type="checkbox"
          class="hidden"
          id={`input_${props.id}`}
          name={props.id}
          checked={checked.value || undefined}
          onInput={(e: Event) => handleChange((e.target as HTMLInputElement).checked)}
        />

        <label
          id={`label_${props.id}`}
          for={`input_${props.id}`}
          class="cursor-pointer text-lg"
        >
          {slots.default?.()}
        </label>
      </div>
    );
  },
  {
    props: ["checked", "id", "onChange"],
  },
);
