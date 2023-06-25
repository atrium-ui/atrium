<docs lang="md">
## Use cases:

- image slider
- Overflowing tabs
- stepless gallary
</docs>

<script lang="ts" setup>
import "../src/index.js";
</script>

<template>
  <Story group="primitives">
    <sv-entity-slider>
      <div class="cell">1a</div>
      <div class="cell">2a</div>
      <div class="cell">3a</div>
      <div class="cell">4a</div>
      <div class="cell">5a</div>
      <div class="cell">6a</div>
      <div class="cell">7a</div>
      <div class="cell ghost">1b</div>
      <div class="cell ghost">2b</div>
      <div class="cell ghost">3b</div>
      <div class="cell ghost">4b</div>
      <div class="cell ghost">5b</div>
      <div class="cell ghost">6b</div>
      <div class="cell ghost">7b</div>
    </sv-entity-slider>
  </Story>
</template>

<style scoped>
.cell {
  user-select: none;
  width: calc(var(--width) * 1px);
  height: calc(var(--width) * 1px);
  box-shadow: inset 0 0 2px currentColor;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: lime;
  font-size: 42px;
  font-weight: 600;
}
</style>
