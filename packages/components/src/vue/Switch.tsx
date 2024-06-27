/* @jsxImportSource vue */
import { defineComponent, ref, effect } from "vue";
import "@sv/elements/toggle";

export const Switch = defineComponent(
  (
    props: {
      name: string;
      checked?: boolean;
      required?: boolean;
      onChange?: (event: Event) => void;
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
        <label
          id={`label_${props.name}`}
          for={`input_${props.name}`}
          class="cursor-pointer text-lg"
        >
          {slots.default?.()}
        </label>

        <button
          role="checkbox"
          aria-checked={checked.value}
          type="button"
          aria-labelledby={`label_${props.name}`}
          onClick={() => handleChange(!checked.value)}
          class={[
            "mt-[2px] w-12 cursor-pointer overflow-hidden rounded-full border border-zinc-700 bg-transparent p-0",
            "outline-none focus-visible:ring focus-visible:ring-white",
          ]}
        >
          <div
            class={[
              "relative block h-6 w-12 rounded-full bg-zinc-500 transition-transform",
              checked.value && "-translate-x-1/2",
              "after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-full after:bg-[currentColor] after:content-['']",
            ]}
          />
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
      </div>
    );
  },
  {
    props: ["checked", "name", "onChange", "required"],
  },
);
