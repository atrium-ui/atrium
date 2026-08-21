<script setup lang="ts">
import "@atrium-ui/elements/select";
import "@atrium-ui/elements/expandable";
import { ref, watch } from "vue";

const props = defineProps<{
  name: string;
  placeholder: string;
  label?: string;
  value?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  select: [e: CustomEvent];
}>();

const currentValue = ref(props.value);

watch(
  () => props.value,
  (newValue) => {
    currentValue.value = newValue;
  },
);

function handleChange(ev: Event) {
  const target = ev.target as HTMLElement & { value?: string };
  currentValue.value = target.value;
}
</script>

<template>
  <div>
    <div v-if="label" class="pb-1 text-sm">
      <label :for="name">{{ label }}</label>
    </div>

    <a-select
      :required="required"
      :value="currentValue"
      :name="name"
      class="relative inline-block w-full [&[opened]_.select-chevron]:rotate-180"
      @change="handleChange"
    >
      <button
        :id="name"
        slot="trigger"
        type="button"
        :aria-label="label"
        aria-haspopup="listbox"
        class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-100 px-3 py-2 text-left outline-hidden transition-colors hover:border-zinc-400 hover:bg-zinc-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500 dark:hover:bg-zinc-700 dark:focus:border-zinc-400"
      >
        <span class="min-w-0 flex-1 truncate" :class="!currentValue && 'text-zinc-500'">
          {{ currentValue || placeholder }}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          class="select-chevron size-4 flex-none text-zinc-500 transition-transform duration-150"
        >
          <path
            d="m5 7.5 5 5 5-5"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div
        class="mt-1 rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <slot />
      </div>
    </a-select>
  </div>
</template>
