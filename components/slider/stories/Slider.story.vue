<script lang="ts" setup>
import "../src";
</script>

<template>
  <Story>
    <sv-slider centered>
      <div class="slide-item">
        <placeholder></placeholder>
      </div>
      <div class="slide-item">
        <placeholder></placeholder>
      </div>
      <div class="slide-item">
        <placeholder></placeholder>
      </div>
    </sv-slider>
  </Story>
</template>

<style scoped>
placeholder {
  display: block;
  height: 400px;
  width: 400px;
  background: #eee;
  border-radius: 8px;
  flex: none;
  padding: 10px;
}
.slide-item {
  padding: 10px;
}
</style>

<docs lang="md">
# sv-slider

A simple and functional slider. Replacing any slider libraries and includes only the necessary features.
</docs>
