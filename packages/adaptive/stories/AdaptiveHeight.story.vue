<script lang="ts" setup>
import { paragraph } from "txtgen";
import "../src/index.js";
import "../../select/src/index.js";

import { reactive } from "vue";

const state = reactive({
  text: paragraph(6),
});

setInterval(() => {
  state.text = paragraph(2 + Math.random() * 10);
}, 1000);
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="adaptive">
      <div class="block"></div>
      <sv-adaptive-height class="adaptive">
        <div class="accordion-content">
          {{ state.text }}
        </div>
      </sv-adaptive-height>
      <div class="block2"></div>
    </Variant>
  </Story>
</template>

<style lang="scss" scoped>
.adaptive {
  background: grey;
}
.block {
  background: red;
  height: 100px;
}
.block2 {
  background: green;
  height: 100px;
}
</style>
