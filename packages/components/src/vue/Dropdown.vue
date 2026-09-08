<script setup lang="ts">
import "@atrium-ui/elements/popover";
import "@atrium-ui/elements/list";
import { twMerge } from "tailwind-merge";

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Comma separated list of allowed placements, e.g. "bottom-start,top-start". */
    placements?: string;
    /** Width of the menu. */
    width?: string;
    class?: string;
  }>(),
  {
    width: "220px",
  },
);

const emit = defineEmits<{
  change: [e: CustomEvent];
}>();
</script>

<template>
  <a-popover-trigger class="relative z-10 w-auto">
    <div slot="trigger">
      <slot name="trigger">
        <button
          type="button"
          class="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <span>{{ label }}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            class="size-4 flex-none text-zinc-400"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </slot>
    </div>

    <a-popover class="group" :placements="placements">
      <div class="w-[max-content] py-1 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
        <a-list
          :style="{ width }"
          :class="
            twMerge(
              'block max-h-[320px] overflow-auto rounded-xl border border-zinc-950/10 bg-white p-1.5 text-sm outline-hidden',
              'shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-4px_rgb(0_0_0/0.12)]',
              'dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_8px_24px_-4px_rgb(0_0_0/0.5)]',
              '-translate-y-1 transition-transform duration-150 group-[&[enabled]]:translate-y-0',
              props.class,
            )
          "
          @change="emit('change', $event as CustomEvent)"
        >
          <slot />
        </a-list>
      </div>
    </a-popover>
  </a-popover-trigger>
</template>
