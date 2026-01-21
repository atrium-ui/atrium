<script setup lang="ts">
import "@sv/elements/select";
import "@sv/elements/expandable";
import { ref, watch } from "vue";
import Button from "./Button.vue";

const props = defineProps<{
  name: string;
  placeholder: string;
  label?: string;
  value?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  select: [e: CustomEvent];
}>();

const currentValue = ref(props.value);

watch(
  () => props.value,
  (newValue) => {
    currentValue.value = newValue;
  },
);

function handleChange(ev: Event) {
  const target = ev.target as HTMLElement & { value?: string };
  currentValue.value = target.value;
}
</script>

<template>
  <div>
    <div v-if="label" class="pb-1 text-sm">
      <label :for="name">{{ label }}</label>
    </div>

    <a-select
      :required="required"
      :value="currentValue"
      :name="name"
      class="relative inline-block w-full"
      @change="handleChange"
    >
      <Button class="w-full" slot="trigger" :aria-label="label">
        <div class="min-w-[150px] text-left">{{ currentValue || placeholder }}</div>
      </Button>

      <div class="mt-1 rounded-md border border-zinc-200 bg-zinc-50 p-1">
        <slot />
      </div>
    </a-select>
  </div>
</template>