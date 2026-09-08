<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  id: string;
  leftLabel?: string;
  rightLabel?: string;
  modelValue?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  leftLabel: "Left",
  rightLabel: "Right",
  modelValue: "left",
});

const emit = defineEmits<{
  "update:modelValue": [value: "left" | "right"];
}>();

const selectedSide = ref<"left" | "right">(props.modelValue);
const isTransitioning = ref(false);
const showLeft = ref(props.modelValue === "left");
const showRight = ref(props.modelValue === "right");

const updatePanels = async (newValue: "left" | "right") => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;

  const oldValue = selectedSide.value;
  selectedSide.value = newValue;
  emit("update:modelValue", newValue);

  if (oldValue === "left") {
    showLeft.value = false;
  } else {
    showRight.value = false;
  }

  await new Promise((resolve) => setTimeout(resolve, 125));

  if (newValue === "left") {
    showLeft.value = true;
  } else {
    showRight.value = true;
  }

  await new Promise((resolve) => setTimeout(resolve, 125));

  isTransitioning.value = false;
};

const handleToggle = () => {
  const newValue = selectedSide.value === "left" ? "right" : "left";
  updatePanels(newValue);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== selectedSide.value && !isTransitioning.value) {
      updatePanels(newValue);
    }
  },
);
</script>

<template>
    <div class="content-toggle-wrapper">
        <div class="inline-flex gap-1 cursor-pointer rounded-xl bg-(--style-fill-gray-hover) p-1"
            @click="handleToggle">
            <input :id="`${id}-left`" type="radio" :name="id" :checked="selectedSide === 'left'"
                class="peer/left hidden" />
            <label :for="`${id}-left`" :class="[
                'cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1 text-center text-sm font-medium transition-colors',
                selectedSide === 'left'
                    ? 'border-gray-200 bg-white text-(--style-typography-body) shadow-sm'
                    : 'text-gray-400 hover:text-(--style-typography-body)'
            ]">
                {{ leftLabel }}
            </label>

            <input :id="`${id}-right`" type="radio" :name="id" :checked="selectedSide === 'right'"
                class="peer/right hidden" />
            <label :for="`${id}-right`" :class="[
                'cursor-pointer whitespace-nowrap rounded-lg border border-transparent px-2.5 py-1 text-center text-sm font-medium transition-colors',
                selectedSide === 'right'
                    ? 'border-gray-200 bg-white text-(--style-typography-body) shadow-sm'
                    : 'text-gray-400 hover:text-(--style-typography-body)'
            ]">
                {{ rightLabel }}
            </label>
        </div>

        <div class="mt-8 relative overflow-hidden">
            <div :class="[
                'transition-opacity',
                showLeft ? '' : 'opacity-0',
                selectedSide === 'left' ? '' : 'absolute inset-0 pointer-events-none'
            ]">
                <slot name="left" />
            </div>
            <div :class="[
                'transition-opacity',
                showRight ? '' : 'opacity-0',
                selectedSide === 'right' ? '' : 'absolute inset-0 pointer-events-none'
            ]">
                <slot name="right" />
            </div>
        </div>
    </div>
</template>
