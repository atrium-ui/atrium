<script lang="ts">
import { defineComponent } from "vue";
import "../src/index";

export default defineComponent({
  data() {
    return {
      progress: 0,
    };
  },
});
</script>

<template>
  <Story>
    <template #controls> Progress:<input v-model.number="progress" /> </template>

    <animated-riv :loaded="progress" src="example.riv"></animated-riv>
  </Story>
</template>

<style scoped>
animated-riv {
  background: black;
}
</style>
