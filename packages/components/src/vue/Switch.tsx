/* @jsxImportSource vue */
import { defineComponent } from "vue";

export const Switch = defineComponent(
  (
    props: {
      name?: string;
      value?: boolean;
      required?: boolean;
      onChange?: (event: Event) => void;
    },
    { slots },
  ) => {
    return () => (
      <div class="flex items-center gap-3">
        {slots.default ? (
          <label
            id={`label_${props.name}`}
            for={`input_${props.name}`}
            class="cursor-pointer text-lg"
          >
            {slots.default?.()}
          </label>
        ) : (
          ""
        )}

        <a-toggle
          class={[
            "group inline-flex",
            "mt-[2px] w-12 cursor-pointer overflow-hidden rounded-full border border-zinc-700 bg-transparent",
            "outline-none focus:ring focus:ring-white",
          ]}
          name={props.name}
          value={props.value?.toString()}
          required={props.required}
          onChange={props.onChange}
        >
          <div
            class={[
              "relative block h-6 w-12 rounded-full bg-accent-200 transition-transform",
              "after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-full after:bg-[currentColor] after:content-['']",
              "-translate-x-1/2 group-[&[value='true']]:translate-x-0",
            ]}
          />
        </a-toggle>
      </div>
    );
  },
  {
    props: ["value", "name", "onChange", "required"],
  },
);
