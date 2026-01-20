<script setup lang="ts">
import { twMerge } from "tailwind-merge";

defineProps<{
  value: string;
  class?: string;
}>();
</script>

<template>
  <a-option
    :class="twMerge(
      'block cursor-pointer rounded-sm px-2',
      'hover:bg-zinc-100 active:bg-zinc-200 [&[selected]]:bg-zinc-200',
      'dark:active:bg-zinc-700 dark:hover:bg-zinc-600 dark:[&[selected]]:bg-zinc-700',
      $props.class,
    )"
    :value="value"
  >
    <div>
      <slot>{{ value }}</slot>
    </div>
  </a-option>
</template>