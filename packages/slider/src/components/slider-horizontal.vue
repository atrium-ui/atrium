<template>
  <div class="slider">
    <div ref="region" class="slider__region" role="region" aria-label="Image slider">
      <div ref="list" class="slider__list" role="list">
        <slot>
          <div class="slider__list-item" data-index="1">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-1080x1920.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="2">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-1080x2560.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="3">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-1280x720.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="4">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-1920x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="5">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-2560x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="6">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-360x480.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="7">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-480x360.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="8">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-720x1280.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>

          <div class="slider__list-item" data-index="9">
            <a href="https://www.google.de" draggable="false">
              <figure>
                <!-- <img src="~/assets/images/dummy-1920x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
                <img src="https://via.placeholder.com/150x300">
              </figure>
            </a>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { Slider } from '../index.vue.js'

export default {
  name: 'SliderHorizontal',
  props: {
    arrows: {
      type: Boolean,
      default: true,
    },
    center: {
      type: Boolean,
      default: false,
    },
    centerSlides: {
      type: Boolean,
      default: false,
    },
    dots: {
      type: Boolean,
      default: true,
    },
    gap: {
      type: String,
      default: '10px',
    },
    goByView: {
      type: Boolean,
      default: false,
    },
    lock: {
      type: Object,
      default() {
        return {
          x: false,
          y: true,
        }
      }
    },
    overflow: {
      type: Boolean,
      default: false,
    },
    overflowScrolling: {
      type: Boolean,
      default: true,
    },
    responsive: {
      type: Array,
      default: () => [],
    },
    rtl: {
      type: Boolean,
      default: false,
    },
    slidesToScroll: {
      type: Number,
      default: 3,
    },
    slidesToShow: {
      type: Number,
      default: 5,
    },
    snap: {
      type: Boolean,
      default: true,
    },
    variableWidth: {
      type: Boolean,
      default: false,
    },
    wheel: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    this.slider = this.createSlider()
  },
  destroyed() {
    if (this.slider) this.slider.destroy()
  },
  methods: {
    createSlider() {
      const container = this.$refs.region
      const list = this.$refs.list

      return new Slider(list, {
        ...this.$props,
        offsets: {
          left: this.center ? container.clientWidth / 2 - list.firstElementChild.clientWidth / 2 : 0,
          right: this.center ? container.clientWidth / 2 - list.lastElementChild.clientWidth / 2 : 0,
        },

        //

        // onInit: (slider) => {
        //   console.log('Slider:onInit')
        // },
        // onMove: (event, slider) => {
        //   console.log('Slider:onMove', event, slider)
        // },
        // onComplete: (x, y, slider) => {
        //   console.log('Slider:onComplete', x, y, slider)
        // },
        // onStart: (event, slider) => {
        //   console.log('Slider:onStart', event, slider)
        // },
        // onEnd: (event, slider) => {
        //   console.log('Slider:onEnd', event, slider)
        // },
        // onTranslate: (x, y, slider) => {
        //   console.log('Slider:onTranslate', slider.currentIndex, slider)
        // },
      })
    },
  },
}
</script>

<style lang="scss">
@import '../slider.scss';
</style>
