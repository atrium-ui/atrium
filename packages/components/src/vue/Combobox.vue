<script setup lang="ts">
import "@sv/elements/select";
import "@sv/elements/expandable";
import { ref } from "vue";
import { twMerge } from "tailwind-merge";
import InputSearch from "./InputSearch.vue";
import type { OptionElement, Select } from "@sv/elements/select";

const props = defineProps<{
  placeholder?: string;
  name?: string;
  value?: string;
  required?: boolean;
  options: Array<{ label: string; value: string }>;
}>();

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

function filteredOptions() {
  return props.options.filter((opt) => !filter.value || opt.label.match(filter.value));
}
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
          class="px-1"
          :placeholder="placeholder"
          :value="filter"
          @keydown="handleKeydown"
          @input="handleInput"
        >
          <div class="flex pr-2">
            <div
              v-for="option in values"
              :key="option.value"
              class="mr-1 flex items-center gap-1 whitespace-nowrap rounded-sm bg-zinc-50 pr-1 pl-2 text-left text-sm leading-none"
            >
              <span>{{ option.innerText }}</span>

              <button
                type="button"
                class="flex items-center justify-center rounded-full bg-zinc-50 p-0 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-[currentColor]"
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

      <div class="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-1">
        <a-option
          v-for="option in filteredOptions()"
          :key="option.value"
          :class="twMerge(
            'block cursor-pointer rounded-sm px-2',
            'hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200',
          )"
          :value="option.value"
        >
          <div>{{ option.label }}</div>
        </a-option>
      </div>
    </a-select>
  </div>
</template>