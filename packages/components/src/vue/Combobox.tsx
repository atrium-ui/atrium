/* @jsxImportSource vue */
import "@sv/elements/select";
import "@sv/elements/expandable";
import { defineComponent, ref } from "vue";
import { twMerge } from "tailwind-merge";
import { Input } from "./Input.jsx";

export const Combobox = defineComponent(
  (
    props: {
      placeholder?: string;
      name?: string;
      value?: string;
      required?: boolean;
      onChange?: (e: CustomEvent) => void;
    },
    { slots },
  ) => {
    const value = ref(props.value);
    const values = ref<Array<string>>([]);

    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        const set = values.value;
        set.pop();
        values.value = set;
      }
    };

    return () => (
      <div>
        <a-select
          multiple={true}
          required={props.required}
          value={value.value}
          name={props.name}
          onChange={async (ev) => {
            const val = ev.option?.value;
            value.value = val;
            props.onChange?.(ev);
            if (val && values.value.indexOf(val) === -1) {
              values.value.push(val);
            }
          }}
          class="relative inline-block w-full"
        >
          <div slot="trigger" class="w-full">
            <Input placeholder={props.placeholder} onKeyup={onKeyup}>
              <div class="flex pr-2">
                {[...values.value].map((value) => (
                  <div
                    key={value}
                    class="mr-1 flex items-center gap-1 whitespace-nowrap rounded bg-zinc-50 pr-1 pl-2 text-left text-sm leading-none dark:bg-zinc-800"
                  >
                    <span>{value}</span>

                    <button
                      type="button"
                      onClick={() => {
                        const arr = values.value;
                        arr.splice(arr.indexOf(value), 1);
                        values.value = arr;
                      }}
                      class="flex items-center justify-center rounded-full bg-zinc-50 p-0 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    >
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="h-4 w-4"
                      >
                        <title>Remove</title>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </Input>
          </div>

          <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800">
            {slots.default?.()}
          </div>
        </a-select>
      </div>
    );
  },
  {
    props: ["value", "placeholder", "required", "name", "onChange"],
  },
);

export const ComboboxItem = function Item(
  props: { value: string; class?: string },
  { slots },
) {
  return (
    <a-option
      class={twMerge(
        "block cursor-pointer rounded px-2",
        "hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200",
        "dark:active:bg-zinc-700 dark:hover:bg-zinc-600 dark:[&[selected]]:bg-zinc-700",
        props.class,
      )}
      value={props.value}
    >
      <div>{slots.default?.() || props.value}</div>
    </a-option>
  );
};
