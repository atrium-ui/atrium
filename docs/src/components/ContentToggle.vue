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
        <div class="grid grid-cols-2 bg-(--style-fill-grey-active) rounded p-1 md:-ml-2 w-full cursor-pointer"
            @click="handleToggle">
            <input :id="`${id}-left`" type="radio" :name="id" :checked="selectedSide === 'left'"
                class="peer/left hidden" />
            <label :for="`${id}-left`" :class="[
                'px-2 py-1 text-xs font-medium rounded cursor-pointer transition-all whitespace-nowrap text-center',
                selectedSide === 'left'
                    ? 'text-(--style-typography-body) bg-white shadow-sm'
                    : 'text-(--style-typography-disabled) hover:bg-white/50'
            ]">
                {{ leftLabel }}
            </label>

            <input :id="`${id}-right`" type="radio" :name="id" :checked="selectedSide === 'right'"
                class="peer/right hidden" />
            <label :for="`${id}-right`" :class="[
                'px-2 py-1 text-xs font-medium rounded cursor-pointer transition-all whitespace-nowrap text-center',
                selectedSide === 'right'
                    ? 'text-(--style-typography-body) bg-white shadow-sm'
                    : 'text-(--style-typography-disabled) hover:bg-white/50'
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
