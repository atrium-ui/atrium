<script lang="ts" setup>
import "../src/index.js";

import { logEvent } from "histoire/client";
import { reactive } from "vue";
import { paragraph } from "txtgen";

const state = reactive({
  current: 3,
});
</script>

<template>
  <Story>
    <a-pager
      count="12"
      :current="state.current"
      @page-change="
        (e) => {
          state.current = e.detail;
        }
      "
    ></a-pager>
  </Story>
</template>

<style scoped>
a-pager {
}
</style>
