<template>
  <div>
    <h1>Nuxt2 Example</h1>
    <Slider></Slider>
  </div>
</template>

<script>
import Slider from "../../../../src/components/slider-horizontal.vue";

export default {
  name: "IndexPage",
  components: {
    Slider,
  },
};
</script>
