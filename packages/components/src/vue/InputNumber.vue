<script setup lang="ts">
import Input from "./Input.vue";

defineProps<{
  class?: string | string[];
  value?: string;
}>();
</script>

<template>
  <Input :class="$props.class" type="number" :value="value" />
</template>