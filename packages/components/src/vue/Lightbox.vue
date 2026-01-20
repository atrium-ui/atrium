<script setup lang="ts">
import { ref } from "vue";
import "@sv/elements/blur";
import "@sv/elements/portal";
import Button from "./Button.vue";
import Icon from "./Icon.vue";

const open = ref(false);

function handleOpen() {
  open.value = true;
}

function handleExit() {
  open.value = false;
}
</script>

<template>
  <button
    type="button"
    class="m-0 block cursor-pointer bg-transparent p-0"
    @click="handleOpen"
  >
    <img
      class="max-w-[200px] bg-zinc-400 object-cover"
      src="https://picsum.photos/id/12/320/180"
      alt=""
    />
  </button>

  <a-portal>
    <a-blur
      :enabled="open || undefined"
      :class="[
        'group/dialog fixed top-0 left-0 z-50 block h-screen w-screen opacity-0 transition-all',
        '[&[enabled]]:bg-[#33333333] [&[enabled]]:opacity-100 [&[enabled]]:backdrop-blur-md',
      ]"
      @exit="handleExit"
    >
      <div
        :class="[
          '-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 transition-all',
          'scale-105 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100',
        ]"
      >
        <slot />
      </div>

      <div class="absolute top-8 right-4 z-50 text-2xl lg:top-20 lg:right-20">
        <Button
          label="close"
          variant="ghost"
          @click="handleExit"
        >
          <Icon name="close" />
        </Button>
      </div>
    </a-blur>
  </a-portal>
</template>