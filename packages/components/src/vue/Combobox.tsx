/* @jsxImportSource vue */
import "@sv/elements/select";
import "@sv/elements/expandable";
import { defineComponent, ref } from "vue";
import { twMerge } from "tailwind-merge";
import { InputSearch } from "./InputSearch.jsx";
import type { OptionElement, Select } from "@sv/elements/select";

const ComboboxItem = function Item(props: { value: string; class?: string }, { slots }) {
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

export const Combobox = defineComponent(
  (props: {
    placeholder?: string;
    name?: string;
    value?: string;
    required?: boolean;
    onChange?: (e: CustomEvent) => void;
    options: Array<{ label: string; value: string }>;
  }) => {
    const value = ref(props.value);
    const values = ref<Array<OptionElement>>([]);
    const filter = ref("");
    const select = ref<Select>();

    const onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement;
      if (e.key === "Backspace" && target.value?.length === 0) {
        const set = values.value;
        set.pop();
        values.value = set;
      }
    };

    return () => (
      <div>
        <a-select
          multiple={true}
          ref={select}
          required={props.required}
          value={value.value}
          name={props.name}
          onChange={async (ev) => {
            value.value = ev.option;
            props.onChange?.(ev);
            if (ev.option && values.value.indexOf(ev.option) === -1) {
              values.value.push(ev.option);
            }
            filter.value = "";
          }}
          class="relative inline-block w-full"
        >
          {/* @ts-ignore */}
          <div slot="trigger" class="w-full">
            <InputSearch
              class="px-1"
              placeholder={props.placeholder}
              value={filter.value}
              onKeydown={onKeydown}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                filter.value = target.value;
                select.value?.open();
              }}
            >
              <div class="flex pr-2">
                {[...values.value].map((option) => (
                  <div
                    key={option.value}
                    class="mr-1 flex items-center gap-1 whitespace-nowrap rounded bg-zinc-50 pr-1 pl-2 text-left text-sm leading-none dark:bg-zinc-800"
                  >
                    <span>{option.innerText}</span>

                    <button
                      type="button"
                      onClick={() => {
                        const arr = values.value;
                        arr.splice(arr.indexOf(option), 1);
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
            </InputSearch>
          </div>

          <div class="mt-1 rounded-md border border-zinc-700 bg-zinc-50 p-1 dark:bg-zinc-800">
            {props.options
              .filter((opt) => !filter.value || opt.label.match(filter.value))
              .map((option) => (
                <ComboboxItem key={option.value} value={option.value}>
                  {option.label}
                </ComboboxItem>
              ))}
          </div>
        </a-select>
      </div>
    );
  },
  {
    props: ["value", "placeholder", "required", "name", "onChange", "options"],
  },
);
