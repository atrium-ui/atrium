<script lang="ts" setup>
import "../src/index.js";
</script>

<template>
  <Story>
    <div>
      This was loaded <sv-time>{{ Date.now() }}</sv-time>
    </div>
  </Story>
</template>

<style scoped>
div {
  font-family: sans-serif;
}
sv-time {
  font-weight: bold;
}
</style>

<docs lang="md">
# Time

This small component will render a timestamp into a self updating tiemr.
</docs>
