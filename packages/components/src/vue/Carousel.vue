<script setup lang="ts">
import "@atrium-ui/elements/track";
import type { Track } from "@atrium-ui/elements/track";
import { twMerge } from "tailwind-merge";
import { computed, onMounted, ref } from "vue";
import Icon from "./Icon.vue";

const props = defineProps<{
  class?: string;
  overflow?: string;
  align?: "start" | "center";
}>();

const track = ref<Track>();
const current = ref(0);
const position = ref(0);
const meta = ref({
  overflowWidth: 0,
  itemCount: 0,
  width: 0,
});

const progress = computed(() => {
  const value =
    1 - (meta.value.overflowWidth - position.value) / meta.value.overflowWidth;
  return Math.min(1, Math.max(0, value));
});

const showNext = computed(() => Math.round(position.value) < meta.value.overflowWidth);
const showPrev = computed(() => position.value >= 100);

onMounted(() => {
  track.value?.shadowRoot?.addEventListener("slotchange", () => {
    track.value?.moveTo(0, "none");
  });
});

function prev() {
  track.value?.moveBy(-1);
}

function next() {
  track.value?.moveBy(1);
}

function onScroll() {
  position.value = track.value?.position.x || 0;
}

function onChange() {
  current.value = track.value?.currentItem || 0;
}

function onFormat() {
  position.value = track.value?.position.x || 0;
  meta.value = {
    itemCount: track.value?.children.length || 0,
    width: track.value?.trackWidth || 0,
    overflowWidth: track.value?.overflowWidth || 0,
  };
}

const containerClass = computed(() =>
  twMerge("@container group/slider relative w-full", props.class),
);

const progressBarClass = computed(() =>
  twMerge(
    "relative flex h-[2px] @lg:w-[400px] w-[200px] items-center bg-[rgba(0,0,0,30%)] drak:bg-[rgba(255,255,255,30%)]",
    meta.value.overflowWidth > 0 ? "opacity-100" : "opacity-0",
  ),
);
</script>

<template>
  <div :class="containerClass">
    <div class="relative w-full">
      <a-track
        ref="track"
        snap
        debug
        class="flex w-full overflow-visible"
        :align="align"
        :overflow="overflow"
        @scroll="onScroll"
        @change="onChange"
        @format="onFormat"
      >
        <slot />
      </a-track>

      <div>
        <button
          :disabled="!showPrev"
          type="button"
          class="absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-xl text-black shadow-sm backdrop-blur-sm opacity-0 transition-[color,background-color,border-color,opacity] group-hover/slider:opacity-100 focus-visible:opacity-100 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-500 disabled:cursor-default disabled:group-hover/slider:opacity-35 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-white/95 cursor-pointer left-3"
          aria-label="Previous page"
          @click="prev"
        >
          <Icon class="block" aria-hidden="true" name="arrow-left" />
        </button>
        <button
          :disabled="!showNext"
          type="button"
          class="absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-xl text-black shadow-sm backdrop-blur-sm opacity-0 transition-[color,background-color,border-color,opacity] group-hover/slider:opacity-100 focus-visible:opacity-100 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-500 disabled:cursor-default disabled:group-hover/slider:opacity-35 disabled:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-white/95 cursor-pointer right-3"
          aria-label="Next page"
          @click="next"
        >
          <Icon class="block" aria-hidden="true" name="arrow-right" />
        </button>
      </div>
    </div>

    <div class="flex justify-center @lg:py-8 pt-5 pb-2">
      <div
        :class="progressBarClass"
        :style="{ '--value': progress }"
      >
        <div
          :class="[
            '-top-[1px] absolute left-[calc(var(--value)*100%-var(--value)*75px)] h-[4px] w-[75px]',
            'rounded-md bg-black transition-none',
          ]"
        />
      </div>
    </div>
  </div>
</template>
