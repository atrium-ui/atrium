<script setup lang="ts">
import { twMerge } from "tailwind-merge";

defineProps<{
  value: string;
  class?: string;
}>();
</script>

<template>
  <a-option
    :class="
      twMerge(
        'block cursor-pointer rounded-md px-3 py-2 text-sm leading-5 outline-hidden transition-colors',
        'hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200 [&[selected]]:font-medium',
        'focus-visible:bg-zinc-100 dark:focus-visible:bg-zinc-800',
        'dark:active:bg-zinc-700 dark:hover:bg-zinc-800 dark:[&[selected]]:bg-zinc-700',
        $props.class,
      )
    "
    :value="value"
  >
    <div>
      <slot>{{ value }}</slot>
    </div>
  </a-option>
</template>
