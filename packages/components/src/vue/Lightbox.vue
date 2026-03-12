<script setup lang="ts">
import "@sv/elements/lightbox";
import Button from "./Button.vue";
import Icon from "./Icon.vue";
</script>

<template>
  <a-lightbox>
    <button
      slot="trigger"
      type="button"
      class="m-0 block cursor-pointer bg-transparent rounded-md overflow-hidden"
    >
      <img
        class="max-w-[200px] bg-zinc-400 object-cover"
        src="https://picsum.photos/id/12/320/180"
        alt=""
      />
    </button>

    <div
      slot="content"
      class="relative flex max-h-[95vh] max-w-[95vw] items-center justify-center [&_img]:max-h-[95vh] [&_img]:max-w-[95vw] [&_img]:object-contain"
    >
      <slot />
    </div>

    <div slot="close" class="fixed top-3 right-3 z-[2] text-2xl lg:top-5 lg:right-5 lg:text-3xl">
      <Button label="close" variant="ghost">
        <Icon name="close" />
      </Button>
    </div>
  </a-lightbox>
</template>
