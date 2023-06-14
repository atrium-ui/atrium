<!--
  This file defines the templates for the visual documentation found in apps/library.
-->

<script lang="ts" setup>
import "../src/index.js";
</script>

<template>
  <Story group="primitives">
    <sv-example prop="example"></sv-example>
  </Story>
</template>

<style scoped>
sv-example {
  display: inline;
}
</style>
