<script setup lang="ts">
import "@atrium-ui/elements/popover";
import Button from "./Button.vue";

defineProps<{
  label?: string;
}>();
</script>

<template>
  <a-popover-trigger class="relative z-10">
    <div slot="trigger">
      <Button v-if="label" slot="trigger" variant="outline">
        {{ label }}
      </Button>
      <slot v-else name="input" />
    </div>

    <a-tooltip class="group">
      <div class="pointer-events-auto w-[max-content] p-2 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
        <div
          :class="[
            'min-w-[180px] rounded-xl border border-zinc-950/10 bg-white p-1.5 text-sm',
            'shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-4px_rgb(0_0_0/0.12)]',
            'dark:border-white/10 dark:bg-zinc-900 dark:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_8px_24px_-4px_rgb(0_0_0/0.5)]',
            'scale-95 transition-all duration-150 group-[&[enabled]]:scale-100',
          ]"
        >
          <slot />
        </div>
      </div>
    </a-tooltip>
  </a-popover-trigger>
</template>
