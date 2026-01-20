<script setup lang="ts">
import { AnimationElement } from "@sv/animation";
import riveWASMResource from "@rive-app/canvas-advanced-lite/rive.wasm?url";

AnimationElement.riveWasm = riveWASMResource;

defineProps<{
  src: string;
  width?: number;
  height?: number;
}>();
</script>

<template>
  <a-animation
    :height="height || 400"
    :width="width || 400"
    :src="src"
  />
</template>