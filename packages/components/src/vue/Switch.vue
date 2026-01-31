<script setup lang="ts">
import { defineComponent } from "vue";

const props = defineProps<{
  name?: string;
  value?: boolean;
  required?: boolean;
}>();

const emit = defineEmits<{
  change: [event: Event];
}>();

function handleChange(event: Event) {
  emit("change", event);
}
</script>

<template>
  <div class="flex items-center gap-3">
    <label
      v-if="$slots.default"
      :id="`label_${name}`"
      :for="`input_${name}`"
      class="cursor-pointer text-lg"
    >
      <slot />
    </label>

    <a-toggle
      :class="[
        'group inline-flex',
        'mt-[2px] w-12 cursor-pointer overflow-hidden rounded-full border border-zinc-200 bg-transparent',
        'outline-hidden focus:ring-2 focus:ring-[currentColor]',
      ]"
      :name="name"
      :value="value?.toString()"
      :required="required"
      @change="handleChange"
    >
      <div
        :class="[
          'relative block h-6 w-12 rounded-full bg-[var(--theme-color,#bfa188)] transition-transform',
          'after:absolute after:top-0 after:right-0 after:h-6 after:w-6 after:rounded-full after:bg-[currentColor] after:content-[\'\']',
          '-translate-x-1/2 group-[&[value=\'true\']]:translate-x-0',
        ]"
      />
    </a-toggle>
  </div>
</template>