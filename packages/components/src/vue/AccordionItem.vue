<script setup lang="ts">
import "@sv/elements/expandable";
import "@sv/svg-sprites/svg-icon";

defineProps<{
  title: string;
  opened?: boolean;
}>();
</script>

<template>
  <li>
    <a-expandable class="group block rounded-md bg-gray-100" :opened="opened">
      <button
        slot="toggle"
        type="button"
        class="flex w-full cursor-pointer items-center justify-between gap-x-6 px-3 py-3 text-left font-light text-xl italic md:px-4 md:py-5"
      >
        <div class="pointer-events-none max-w-[50rem]">
          <span>{{ title }}</span>
        </div>
        <div>
          <svg-icon
            class="group-[[opened]]:-scale-100"
            name="chevron-down"
          ></svg-icon>
        </div>
      </button>
      <div class="px-3 pb-4 md:px-4 md:pb-6">
        <div>
          <slot />
        </div>
      </div>
    </a-expandable>
  </li>
</template>