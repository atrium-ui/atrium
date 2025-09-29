/* @jsxImportSource vue */
import { defineComponent, ref, effect } from "vue";
import { Icon } from "./Icon.js";

export const Checkbox = defineComponent(
  (
    props: {
      name: string;
      checked?: boolean;
      required?: boolean;
      onChange?: (event: Event) => void;
      label?: string;
    },
    { slots },
  ) => {
    const checked = ref(props.checked);
    const input = ref<HTMLInputElement>();

    effect(() => {
      checked.value = props.checked;
    });

    const handleChange = (value: boolean) => {
      checked.value = value;
      if (input.value) {
        input.value.checked = value;
        input.value.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    return () => (
      <div class="flex items-start gap-3">
        {/** biome-ignore lint/a11y/useSemanticElements: no */}
        <button
          role="checkbox"
          aria-checked={checked.value}
          aria-label={props.label}
          type="button"
          aria-labelledby={`label_${props.name}`}
          onClick={() => handleChange(!checked.value)}
          class={[
            "mt-[2px] h-6 w-6 cursor-pointer rounded-md border border-zinc-200 bg-transparent p-0 align-bottom hover:border-zinc-600",
            "outline-hidden focus:ring-2 focus:ring-[currentColor]",
          ]}
        >
          <div
            aria-hidden="true"
            class={["flex items-center justify-center", !checked.value && "hidden"]}
          >
            <Icon name="check" />
          </div>
        </button>

        <input
          inert
          ref={input}
          required={props.required}
          type="checkbox"
          class="hidden"
          id={`input_${props.name}`}
          name={props.name}
          checked={checked.value || undefined}
          onInput={(e: Event) => handleChange((e.target as HTMLInputElement).checked)}
        />

        <label
          id={`label_${props.name}`}
          for={`input_${props.name}`}
          class="cursor-pointer text-lg"
        >
          {slots.default?.()}
        </label>
      </div>
    );
  },
  {
    props: ["checked", "name", "onChange", "required"],
  },
);
