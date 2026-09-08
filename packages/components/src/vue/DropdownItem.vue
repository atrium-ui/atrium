<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import { computed, useSlots } from "vue";

const props = defineProps<{
  /** Renders the item as a link. */
  href?: string;
  /** Keyboard shortcut shown on the right hand side. */
  shortcut?: string;
  /** Styles the item as a destructive action. */
  danger?: boolean;
  disabled?: boolean;
  /** Keeps the dropdown open after the item was clicked. */
  keepOpen?: boolean;
  class?: string;
}>();

const emit = defineEmits<{
  click: [e: MouseEvent];
}>();

const slots = useSlots();

function handleClick(e: MouseEvent) {
  if (props.disabled) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }

  emit("click", e);

  if (!props.keepOpen) {
    (e.target as HTMLElement).dispatchEvent(
      new CustomEvent("exit", { bubbles: true, cancelable: true }),
    );
  }
}

const classes = computed(() =>
  twMerge(
    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left text-sm leading-6 no-underline outline-hidden transition-colors",
    "text-zinc-800 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-100 dark:active:bg-zinc-700 dark:hover:bg-zinc-800",
    props.danger
      ? "text-red-600 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:active:bg-red-950/60 dark:hover:bg-red-950/40"
      : "",
    props.disabled ? "pointer-events-none opacity-40" : "",
    props.class,
  ),
);
</script>

<template>
  <a-list-item
    class="block [&:focus-within>*]:bg-zinc-100 dark:[&:focus-within>*]:bg-zinc-800 [&[aria-selected='true']>*]:bg-zinc-100 dark:[&[aria-selected='true']>*]:bg-zinc-800"
    :aria-disabled="disabled || undefined"
  >
    <component
      :is="href ? 'a' : 'button'"
      :type="href ? undefined : 'button'"
      :href="href"
      tabindex="-1"
      :class="classes"
      @click="handleClick"
    >
      <span v-if="slots.icon" class="flex size-4 flex-none items-center justify-center text-zinc-400 [&_svg]:size-4">
        <slot name="icon" />
      </span>

      <span class="min-w-0 flex-1 truncate">
        <slot />
      </span>

      <span v-if="shortcut" class="flex-none text-xs text-zinc-400 tabular-nums">
        {{ shortcut }}
      </span>
    </component>
  </a-list-item>
</template>
