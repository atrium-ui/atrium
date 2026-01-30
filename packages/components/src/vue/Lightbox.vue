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
      class="group/dialog fixed inset-0 z-50 block h-screen w-screen opacity-0 transition-opacity bg-[#33333333] [&[enabled]]:opacity-100 flex justify-center items-center"
      @exit="handleExit"
    >
      <div class="relative scale-95 flex group-[&[enabled]]/dialog:scale-100 max-w-[95vw] max-h-[95vh] [&>img]:object-contain">
        <slot />
      </div>

      <div class="absolute top-2 right-2 z-50 text-2xl lg:top-5 lg:right-5">
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
