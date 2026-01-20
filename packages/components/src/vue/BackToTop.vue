<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { twMerge } from "tailwind-merge";
import "@sv/svg-sprites/svg-icon";

const SHOW_THRESHOLD_SCREEN_HEIGHTS = 3;

defineProps<{
  visible?: boolean;
}>();

const showButton = ref(false);

function updateVisibilityConditions() {
  const scrolledScreenHeights = window.scrollY / window.innerHeight;
  showButton.value = scrolledScreenHeights > SHOW_THRESHOLD_SCREEN_HEIGHTS;
}

function onButtonClicked() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  window.addEventListener("scroll", updateVisibilityConditions);
  window.addEventListener("resize", updateVisibilityConditions);
  updateVisibilityConditions();
});

onUnmounted(() => {
  window.removeEventListener("scroll", updateVisibilityConditions);
  window.removeEventListener("resize", updateVisibilityConditions);
});

function getButtonClass(isVisible: boolean) {
  return twMerge(
    isVisible ? "opacity-100" : "pointer-events-none opacity-0",
    "absolute mq2:right-3 mq4:right-[44px] right-[128px] bottom-0 transition-opacity ease-linear",
    "flex h-10 w-10 items-center justify-center rounded-md shadow-2xl",
    "hover:text-white active:text-white",
    "bg-blue-50 hover:bg-blue-400 active:bg-blue-200",
    "text-2xl",
  );
}
</script>

<template>
  <div class="w-full fixed right-0 bottom-element-l mq4:bottom-10 left-0">
    <button
      :class="getButtonClass(showButton || visible)"
      @click="onButtonClicked"
    >
      <svg-icon name="arrow-up"></svg-icon>
      <span class="sr-only">Go to the top of the page</span>
    </button>
  </div>
</template>