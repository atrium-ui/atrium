<script setup lang="ts">
import "@atrium-ui/elements/select";
import "@atrium-ui/elements/expandable";
import { computed, ref } from "vue";
import { twMerge } from "tailwind-merge";
import InputSearch from "./InputSearch.vue";
import type { OptionElement, Select } from "@atrium-ui/elements/select";

export type ComboboxOption = {
  label: string;
  value: string;
  /** Options with the same group are rendered under a shared label. */
  group?: string;
};

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    name?: string;
    value?: string;
    required?: boolean;
    options: Array<ComboboxOption>;
    /** Maximum number of options rendered at once. */
    maxOptions?: number;
    /** Message shown when nothing matches the filter. */
    emptyLabel?: string;
  }>(),
  {
    maxOptions: 10,
    emptyLabel: "No results",
  },
);

const emit = defineEmits<{
  change: [e: CustomEvent];
}>();

const currentValue = ref(props.value);
const values = ref<Array<OptionElement>>([]);
const filter = ref("");
const selectRef = ref<Select>();

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLInputElement;
  if (e.key === "Backspace" && target.value?.length === 0) {
    values.value.pop();
  }
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  filter.value = target.value;
  selectRef.value?.open();
}

async function handleChange(ev: CustomEvent) {
  const option = (ev as CustomEvent & { option: OptionElement }).option;
  currentValue.value = option;
  emit("change", ev);
  if (option && values.value.indexOf(option) === -1) {
    values.value.push(option);
  }
  filter.value = "";
}

function removeValue(option: OptionElement) {
  const index = values.value.indexOf(option);
  if (index > -1) {
    values.value.splice(index, 1);
  }
}

const filteredOptions = computed(() => {
  const query = filter.value.trim().toLowerCase();
  if (!query) return props.options;
  return props.options.filter((opt) => opt.label.toLowerCase().includes(query));
});

const visibleOptions = computed(() => filteredOptions.value.slice(0, props.maxOptions));

const hiddenCount = computed(
  () => filteredOptions.value.length - visibleOptions.value.length,
);

/** Visible options, in order, split into their groups. */
const groups = computed(() => {
  const list: Array<{ label?: string; options: Array<ComboboxOption> }> = [];
  for (const option of visibleOptions.value) {
    const last = list[list.length - 1];
    if (last && last.label === option.group) {
      last.options.push(option);
    } else {
      list.push({ label: option.group, options: [option] });
    }
  }
  return list;
});
</script>

<template>
  <div>
    <a-select
      ref="selectRef"
      :multiple="true"
      :required="required"
      :value="currentValue"
      :name="name"
      class="relative inline-block w-full"
      @change="handleChange"
    >
      <div slot="trigger" class="w-full">
        <InputSearch
          class="items-center gap-2 rounded-lg px-3"
          :placeholder="placeholder"
          :value="filter"
          @keydown="handleKeydown"
          @input="handleInput"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="size-4 flex-none self-center text-zinc-400"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="m20 20-4.5-4.5" stroke-linecap="round" />
          </svg>

          <div v-if="values.length" class="flex pr-2">
            <div
              v-for="option in values"
              :key="option.value"
              class="mr-1 flex items-center gap-1 whitespace-nowrap rounded-md bg-zinc-100 py-0.5 pr-1 pl-2 text-left text-sm leading-5 dark:bg-zinc-800"
            >
              <span>{{ option.innerText }}</span>

              <button
                type="button"
                class="flex cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-zinc-400 hover:text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[currentColor] dark:hover:text-zinc-100"
                @click="removeValue(option)"
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
          </div>
        </InputSearch>
      </div>

      <div
        :class="[
          'mt-1 max-h-[320px] overflow-auto rounded-xl border border-zinc-950/10 bg-white p-1.5 text-sm',
          'shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-4px_rgb(0_0_0/0.12)]',
          'dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_8px_24px_-4px_rgb(0_0_0/0.5)]',
        ]"
      >
        <template v-for="(group, i) in groups" :key="`group_${i}`">
          <div
            v-if="group.label"
            class="px-2.5 pt-2 pb-1 text-xs text-zinc-400 first:pt-1"
          >
            {{ group.label }}
          </div>

          <a-option
            v-for="option in group.options"
            :key="option.value"
            :class="twMerge(
              'block cursor-pointer truncate rounded-lg px-2.5 py-1.5 leading-6 outline-hidden transition-colors',
              'hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200 [&[selected]]:font-medium',
              'focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800',
              'dark:active:bg-zinc-700 dark:hover:bg-zinc-800 dark:[&[selected]]:bg-zinc-700',
            )"
            :value="option.value"
          >
            <slot name="option" :option="option">{{ option.label }}</slot>
          </a-option>
        </template>

        <div v-if="!filteredOptions.length" class="px-2.5 py-2 text-zinc-400">
          {{ emptyLabel }}
        </div>

        <div v-else-if="hiddenCount > 0" class="px-2.5 pt-2 pb-1 text-xs text-zinc-400">
          {{ hiddenCount }} more — keep typing to narrow the list
        </div>
      </div>
    </a-select>
  </div>
</template>
