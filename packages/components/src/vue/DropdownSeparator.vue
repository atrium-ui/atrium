<script setup lang="ts">
import { twMerge } from "tailwind-merge";

const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    role="separator"
    :class="twMerge('-mx-1.5 my-1.5 h-px bg-zinc-950/10 dark:bg-white/10', props.class)"
  />
</template>
