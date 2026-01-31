<script setup lang="ts">
import { ref, watch } from "vue";
import Icon from "./Icon.vue";

const props = defineProps<{
  name: string;
  checked?: boolean;
  required?: boolean;
  label?: string;
}>();

const emit = defineEmits<{
  change: [event: Event];
}>();

const isChecked = ref(props.checked);
const input = ref<HTMLInputElement>();

watch(
  () => props.checked,
  (newValue) => {
    isChecked.value = newValue;
  },
);

function handleChange(value: boolean) {
  isChecked.value = value;
  if (input.value) {
    input.value.checked = value;
    const event = new Event("change", { bubbles: true });
    input.value.dispatchEvent(event);
    emit("change", event);
  }
}
</script>

<template>
  <div class="flex items-start gap-3">
    <button
      role="checkbox"
      type="button"
      :aria-checked="isChecked"
      :aria-label="label"
      :aria-labelledby="`label_${name}`"
      :class="[
        'mt-[2px] h-6 w-6 cursor-pointer rounded-md border border-zinc-200 bg-transparent p-0 align-bottom hover:border-zinc-600',
        'outline-hidden focus:ring-2 focus:ring-[currentColor]',
      ]"
      @click="handleChange(!isChecked)"
    >
      <div
        aria-hidden="true"
        :class="['flex items-center justify-center', !isChecked && 'hidden']"
      >
        <Icon name="check" />
      </div>
    </button>

    <input
      ref="input"
      inert
      :required="required"
      type="checkbox"
      class="hidden"
      :id="`input_${name}`"
      :name="name"
      :checked="isChecked || undefined"
      @input="handleChange(($event.target as HTMLInputElement).checked)"
    />

    <label
      :id="`label_${name}`"
      :for="`input_${name}`"
      class="cursor-pointer text-lg"
    >
      <slot />
    </label>
  </div>
</template>