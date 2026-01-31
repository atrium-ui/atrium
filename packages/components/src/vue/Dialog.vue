<script setup lang="ts">
import { ref } from "vue";
import "@sv/elements/blur";
import "@sv/elements/portal";
import Button from "./Button.vue";

defineProps<{
  label?: string;
  class?: string;
}>();

const open = ref(false);

function handleOpen() {
  open.value = true;
}

function handleExit() {
  open.value = false;
}
</script>

<template>
  <div>
    <Button :class="$props.class" @click="handleOpen">
      {{ label }}
    </Button>

    <a-portal>
      <a-blur
        :enabled="open || undefined"
        class="group/dialog fixed top-0 left-0 z-50 block h-full w-full transition-colors [&[enabled]]:bg-[#00000010]"
        @exit="handleExit"
      >
        <div
          :class="[
            'rounded-lg border px-8 py-8 opacity-0 transition-all',
            'border-zinc-200 bg-zinc-50',
            '-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 min-w-[400px]',
            'scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100 group-[&[enabled]]/dialog:opacity-100',
          ]"
        >
          <slot />
        </div>
      </a-blur>
    </a-portal>
  </div>
</template>