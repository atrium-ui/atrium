<script setup lang="ts">
import "@atrium-ui/elements/track";
import { twMerge } from "tailwind-merge";
import { ref, watch, useSlots, computed } from "vue";

const props = defineProps<{
  active: number;
  class?: string | string[];
  label?: string;
}>();

const emit = defineEmits<{
  change: [tab: number];
}>();

const slots = useSlots();
const active = ref<number>(props.active);
const tabs = computed(() => slots.default?.() ?? []);
const buttons = ref<HTMLButtonElement[]>([]);

watch(
  () => props.active,
  (newValue) => {
    active.value = newValue;
  },
);

function selectTab(index: number) {
  active.value = index;
  emit("change", index);
}

function focusTab(index: number) {
  const next = (index + tabs.value.length) % tabs.value.length;
  buttons.value[next]?.focus();
  selectTab(next);
}

function handleKeydown(e: KeyboardEvent, index: number) {
  switch (e.key) {
    case "ArrowRight":
      focusTab(index + 1);
      break;
    case "ArrowLeft":
      focusTab(index - 1);
      break;
    case "Home":
      focusTab(0);
      break;
    case "End":
      focusTab(tabs.value.length - 1);
      break;
    default:
      return;
  }
  e.preventDefault();
}

function getTabClass(index: number) {
  return twMerge(
    "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent",
    "px-3 py-1.5 font-sans text-sm transition-colors",
    "outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-400/50",
    active.value === index
      ? "border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
  );
}
</script>

<template>
  <div
    :class="
      twMerge(
        'inline-block max-w-full rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800',
        props.class,
      )
    "
  >
    <a-track>
      <ul class="flex list-none gap-1 p-0" role="tablist" :aria-label="label">
        <li v-for="(tab, i) in tabs" :key="`tab_${i}`" role="presentation">
          <button
            :ref="(el) => (buttons[i] = el as HTMLButtonElement)"
            type="button"
            role="tab"
            :aria-selected="active === i"
            :tabindex="active === i ? 0 : -1"
            :class="getTabClass(i)"
            @click="selectTab(i)"
            @keydown="handleKeydown($event, i)"
          >
            <component :is="tab" />
          </button>
        </li>
      </ul>
    </a-track>
  </div>
</template>
