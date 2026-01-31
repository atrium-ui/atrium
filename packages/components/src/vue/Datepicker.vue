<script setup lang="ts">
import "@sv/elements/popover";
import { ref } from "vue";
import Input from "./Input.vue";

const emit = defineEmits<{
  change: [value: CustomEvent<{ date: Date }>];
}>();

const value = ref<string>();

function handleChange(ev: Event) {
  const target = ev.target as HTMLElement & { value?: string };
  value.value = target.value;
  requestAnimationFrame(() => {
    (ev.target as HTMLElement).dispatchEvent(new CustomEvent("exit"));
  });
}
</script>

<template>
  <a-popover-trigger class="relative z-10">
    <div slot="trigger">
      <Input placeholder="Select a date" :value="value" />
    </div>

    <a-popover class="group" placements="bottom">
      <div class="w-[max-content] p-3 opacity-0 transition-opacity duration-100 group-[&[enabled]]:opacity-100">
        <div class="min-w-[100px] scale-95 rounded-md bg-white p-1 shadow-lg transition-all duration-150 group-[&[enabled]]:scale-100">
          <a-calendar @change="handleChange" />
        </div>
      </div>
    </a-popover>
  </a-popover-trigger>
</template>