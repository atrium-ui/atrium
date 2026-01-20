<script setup lang="ts">
import "@sv/elements/portal";
import "@sv/elements/blur";

defineProps<{
  enabled?: boolean;
}>();
</script>

<template>
  <a-portal>
    <a-blur
      id="sheet"
      scrolllock
      :enabled="enabled"
      class="group/blur fixed top-0 left-0 block h-full w-full transition-all [&[enabled]]:bg-[#33333333]"
    >
      <div
        :class="[
          'group-[&[enabled]]/blur:-translate-x-full absolute top-0 left-full h-full w-full overflow-auto px-4 py-12 transition-all sm:w-96',
          'bg-zinc-100',
        ]"
      >
        <slot />
      </div>
    </a-blur>
  </a-portal>
</template>