<script setup lang="ts">
import Input from "./Input.vue";

defineProps<{
  class?: string | string[];
  value?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  keydown: [e: KeyboardEvent];
  input: [e: Event];
}>();

function handleKeydown(e: KeyboardEvent) {
  emit("keydown", e);
}

function handleInput(e: Event) {
  emit("input", e);
}
</script>

<template>
  <Input
    :placeholder="placeholder"
    :class="$props.class"
    type="search"
    autocomplete="search"
    :value="value"
    @keydown="handleKeydown"
    @input="handleInput"
  >
    <slot />
  </Input>
</template>