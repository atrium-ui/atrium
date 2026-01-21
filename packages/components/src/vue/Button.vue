<script setup lang="ts">
import { twJoin } from "tailwind-merge";
import { computed } from "vue";

const buttonVariants = {
  base: [
    "inline-flex items-center gap-1 rounded-md font-sans",
    "aria-disabled:pointer-events-none cursor-pointer",
  ],
  default: [
    "border-0 bg-blue-400 px-4 py-2 text-white transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
  outline: [
    "bg-transparent transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "border-1 border-blue-300 hover:border-blue-100 active:border-blue-300",
    "aria-disabled:text-gray-300 aria-disabled:before:border-gray-200",
    "py-[calc(0.5rem-1px)] px-[calc(1rem-1px)]",
  ],
  ghost: [
    "border-0 bg-gray-50 px-4 py-2 transition-colors",
    "hover:bg-blue-200 hover:text-white",
    "active:bg-blue-300 active:transition-none",
    "aria-disabled:bg-gray-100 aria-disabled:text-gray-300",
  ],
};

const props = defineProps<{
  type?: "button" | "submit" | "reset";
  inert?: boolean;
  class?: string | string[];
  disabled?: boolean;
  autofocus?: boolean;
  variant?: keyof typeof buttonVariants;
  label?: string;
}>();

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();

const classes = computed(() =>
  twJoin(buttonVariants.base, buttonVariants[props.variant ?? "default"], props.class),
);

function handleClick(e: MouseEvent) {
  if (props.disabled) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  emit("click", e);
}
</script>

<template>
  <button
    :type="type || 'button'"
    :inert="inert || undefined"
    :autofocus="autofocus || undefined"
    :aria-disabled="disabled || undefined"
    :class="classes"
    :title="label"
    :aria-label="label"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
