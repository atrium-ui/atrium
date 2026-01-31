<script setup lang="ts">
import "@sv/elements/form";

defineProps<{
  field: {
    name: string;
    label?: string;
    description?: string;
    error?: string;
  };
}>();
</script>

<template>
  <a-form-field>
    <div>
      <div v-if="field.label" class="pb-1">
        <label :for="field.name" class="font-bold text-xs uppercase">
          <template v-if="!field.description">{{ field.label }}</template>
        </label>
      </div>

      <slot />

      <div v-if="field.description" class="form-field-description">
        <label :for="field.name">{{ field.description }}</label>
      </div>
    </div>

    <div class="pt-1 text-red-400 text-xs">
      <a-form-field-error />
    </div>
  </a-form-field>
</template>