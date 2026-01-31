<script setup lang="ts">
import "@sv/elements/popover";
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

    <a-popover class="group">
      <div class="w-[max-content] p-2 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
        <div
          :class="[
            'min-w-[100px] rounded-md border border-zinc-200 bg-zinc-50 p-1',
            'scale-95 transition-all duration-150 group-[&[enabled]]:scale-100',
          ]"
        >
          <slot />
        </div>
      </div>
    </a-popover>
  </a-popover-trigger>
</template>