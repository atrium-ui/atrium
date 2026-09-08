<script setup lang="ts">
import { ref } from "vue";
import "@atrium-ui/elements/blur";
import "@atrium-ui/elements/portal";
import Button from "./Button.vue";

defineProps<{
  label?: string;
  class?: string;
  /** Hides the close button in the top right corner. */
  hideClose?: boolean;
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
        class="group/dialog fixed top-0 left-0 z-50 block h-full w-full transition-colors [&[enabled]]:bg-black/15"
        @exit="handleExit"
      >
        <div
          role="dialog"
          aria-modal="true"
          :class="[
            'rounded-2xl border p-6 opacity-0 transition-all',
            'border-zinc-950/5 bg-white dark:border-white/10 dark:bg-zinc-900',
            'shadow-[0_2px_4px_rgb(0_0_0/0.04),0_24px_48px_-12px_rgb(0_0_0/0.25)]',
            '-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2',
            'min-w-[400px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-auto',
            'scale-95 group-[&[enabled]]/dialog:block group-[&[enabled]]/dialog:scale-100 group-[&[enabled]]/dialog:opacity-100',
          ]"
        >
          <button
            v-if="!hideClose"
            type="button"
            aria-label="Close"
            class="absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            @click="handleExit"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
              <path d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>

          <slot />

          <div
            v-if="$slots.footer"
            :class="[
              '-mx-6 -mb-6 mt-6 flex items-center justify-end gap-2 rounded-b-2xl px-6 py-4',
              'border-zinc-950/5 border-t bg-zinc-50 dark:border-white/10 dark:bg-zinc-800/40',
            ]"
          >
            <slot name="footer" />
          </div>
        </div>
      </a-blur>
    </a-portal>
  </div>
</template>
