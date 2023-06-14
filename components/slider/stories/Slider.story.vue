<script lang="ts" setup>
import "../src";
</script>

<template>
  <Story>
    <Variant title="Full width">
      <sv-slider class="full" centered>
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
    </Variant>

    <Variant title="Fixed width items">
      <sv-slider class="three">
        <div class="slide-item">
          <placeholder></placeholder>
        </div>
        <div class="slide-item">
          <placeholder></placeholder>
        </div>
        <div class="slide-item">
          <placeholder></placeholder>
        </div>
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
    </Variant>
  </Story>
</template>

<style scoped>
sv-slider {
  overflow: hidden;
}

.full placeholder {
  display: block;
  height: 400px;
  width: 90vw;
  background: #eee;
  border-radius: 8px;
  flex: none;
  padding: 10px;
}
.slide-item {
  padding: 10px;
}

.three placeholder {
  display: block;
  height: 300px;
  width: 300px;
  background: #eee;
  border-radius: 8px;
  flex: none;
  padding: 10px;
}
</style>

<docs lang="md">
# sv-slider

A simple and functional slider. Replacing any slider libraries and includes only the necessary features.
</docs>
