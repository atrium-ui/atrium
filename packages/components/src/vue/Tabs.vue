<script setup lang="ts">
import "@sv/elements/track";
import Button from "./Button.vue";
import { twMerge } from "tailwind-merge";
import { ref, watch, useSlots } from "vue";

const props = defineProps<{
  active: number;
}>();

const emit = defineEmits<{
  change: [tab: number];
}>();

const slots = useSlots();
const active = ref<number>(props.active);

watch(
  () => props.active,
  (newValue) => {
    active.value = newValue;
  }
);

function handleTabClick(index: number) {
  active.value = index;
  emit("change", index);
}

function getTabClass(index: number) {
  return twMerge(
    "whitespace-nowrap rounded-lg bg-transparent opacity-30",
    active.value === index ? "opacity-100" : "",
  );
}
</script>

<template>
  <div class="w-full p-1">
    <a-track>
      <ul class="flex list-none gap-1 p-0">
        <li v-for="(_, i) in slots.default?.()" :key="`tab_${i}`">
          <Button
            variant="ghost"
            :class="getTabClass(i)"
            @click="handleTabClick(i)"
          >
            <component :is="slots.default?.()[i]" />
          </Button>
        </li>
      </ul>
    </a-track>
  </div>
</template>