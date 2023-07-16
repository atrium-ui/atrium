<script lang="ts" setup>
import { reactive } from "vue";
import "../src/index";

const state = reactive({
  value: 69,
});
</script>

<template>
  <Story>
    <sv-circle :progress="state.value" :size="70" :thickness="4" style="color: #72e0ff">
      <!-- <input style="width: 40px" type="number" v-model="state.value" /> -->
    </sv-circle>

    <template #controls>
      <label>Value:</label>
      <input type="number" v-model="state.value" />
    </template>
  </Story>
</template>

<style scoped>
sv-tabs {
  font-family: sans-serif;
}
</style>
