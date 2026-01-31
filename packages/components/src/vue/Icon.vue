<script setup lang="ts">
import "@sv/svg-sprites/svg-icon";

defineProps<{
  name?: string;
  class?: string | string[];
}>();
</script>

<template>
  <svg-icon
    aria-hidden="true"
    :class="['flex-none aspect-square h-[1em] w-[1em]', $props.class]"
    :name="name || 'unknown'"
  ></svg-icon>
</template>