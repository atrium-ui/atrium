<template>
  <div class="slider" :dir="rtl ? 'rtl' : 'ltr'" :class="[`slider--${mode}`, { 'slider--is-mounted': isMounted, 'slider--variable-width' : variableWidth, 'slider--variable-height' : variableHeight }]" :style="style">
    <!-- <div>
      <div>speed x: <span v-if="current.speed">{{ current.speed.x }}</span></div>
      <div>speed dist: <span v-if="current.speed">{{ current.speed.dist }}</span></div>
    </div> -->
    <!-- track -->
    <div ref="region" class="slider__region" role="region" aria-label="Image slider" tabindex="0">
      <!-- <ol ref="list" class="slider__list" role="list" :style="{ transform }" @touchstart="preventStart" @touchmove="preventMove" @touchend="preventEnd"> -->
      <ol ref="list" class="slider__list" role="list" :style="{ transform }">
        <!-- <slot /> -->
        <!-- <li class="slider__list-item" data-index="1">
          <video width="1280px" height="720px" playsinline muted autoplay src="~/assets/videos/dummy-1280x720.mp4" />
        </li> -->

        <li class="slider__list-item" data-index="2">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-1080x2560.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@simonhumlr?utm_source=slider+demo&amp;utm_medium=referral ">Simon HUMLER</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="3">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-1280x720.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@markusspiske?utm_source=slider+demo&amp;utm_medium=referral ">Markus Spiske</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="4">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-1920x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@qjsmith?utm_source=slider+demo&amp;utm_medium=referral ">Quinn Smith</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="5">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-2560x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@christina_kozak?utm_source=slider+demo&amp;utm_medium=referral ">Christine Kozak</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="6">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-360x480.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@covene?utm_source=slider+demo&amp;utm_medium=referral ">Covene</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="7">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-480x360.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@ryanklausphotography?utm_source=slider+demo&amp;utm_medium=referral ">Ryan KLAUS</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="8">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-720x1280.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@brunocervera?utm_source=slider+demo&amp;utm_medium=referral ">BRUNO EMMANUELLE</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>

        <li class="slider__list-item" data-index="9">
          <a href="https://www.google.de" draggable="false">
            <figure>
              <!-- <img src="~/assets/images/dummy-1920x1080.png" alt="" decoding="async" loading="lazy" width="auto" height="100%"> -->
              <!-- <figcaption>Photo by <a href="https://unsplash.com/@drewtilk?utm_source=slider+demo&amp;utm_medium=referral ">Drew Tilk</a> on <a href="https://unsplash.com/?utm_source=slider+demo&amp;utm_medium=referral">Unsplash</a></figcaption> -->
            </figure>
          </a>
        </li>
      </ol>

      <!-- buttons -->
      <div v-if="slider && arrows" class="slider__arrows">
        <div class="slider__arrows-prev" :class="{ 'slider__arrows--disabled': current.index === (rtl ? children.length - 1 : 0) }" @click="onClickArrowPrev">
          <slot name="button-prev">
            &lt;
          </slot>
        </div>
        <div class="slider__arrows-next" :class="{ 'slider__arrows--disabled': current.index === (rtl ? 0 : children.length - 1) }" @click="onClickArrowNext">
          <slot name="button-next">
            &gt;
          </slot>
        </div>
      </div>
    </div>

    <!-- dots -->
    <ol v-if="slider && dots" class="slider__dots">
      <li v-for="(child, index) in children" :key="index" class="slider__dots-item" :class="{ 'slider__dots-item--current': current.index === index }" @click="onClickDot($event, index)">
        {{ index + 1 }}
      </li>
    </ol>
  </div>
</template>

<script>
import { Dragger, Slider } from '../index.vue.js'
import { resizeObserver } from '../utils/utils.js'
// import Slider from '~/utils/draggable.gsap.slider.js'
// import mixinResizeObserver from '~/mixins/resize-observer'

export default {
  name: 'slider4',
  // mixins: [mixinResizeObserver],
  props: {
    arrows: {
      type: Boolean,
      default: true,
    },
    center: {
      type: Boolean,
      default: true,
    },
    dots: {
      type: Boolean,
      default: true,
    },
    rtl: {
      type: Boolean,
      default: false,
    },
    snap: {
      type: Boolean,
      default: true,
    },
    slidesToShow: {
      type: Number,
      default: 1,
    },
    variableHeight: {
      type: Boolean,
      default: false,
    },
    variableWidth: {
      type: Boolean,
      default: false,
    },
    gap: {
      type: String,
      default: '2vw', // '10px',
    },
    mode: {
      type: String,
      default: 'vertical',
    },
    overflow: {
      type: Boolean,
      default: false,
    },
    overflowScrolling: {
      type: Boolean,
      default: true,
    },
    mousewheel: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isMounted: false,
      children: [],
      current: { index: 0, x: 0, y: 0, speed: null },
      slider: null,
      style: {
        '--gap': this.gap,
        '--overflow': this.overflow ? 'visible' : 'hidden',
        '--slidesCount': this.$slots.default ? this.$slots.default.length : 9 * 4, // 9 === default slot
        '--slidesToShow': this.slidesToShow,
      },
    }
  },
  computed: {
    transform() {
      return `translate3d(${this.current.x}px,0,0)`
    },
  },
  mounted() {
    // this.resizeObserver = new resizeObserver()

    this.list = this.$refs.list
    this.container = this.$refs.region

    // this.list.addEventListener('transitionend', () => (this.isScrolling = false))

    // store rendered children
    this.children = Array.from(this.list.children)

    this.createSlider()

    // listen on resize
    this.resizeObserver = new resizeObserver(() => {
      this.updateStyles()

      // trigger updateStyles twice to get styles applied...
      setTimeout(() => {
        this.updateStyles()

        // wait for css styles to get right element dimensions
        setTimeout(() => {
          // doppelt hält besser
          setTimeout(() => {
            this.slider && this.slider.updateBounds()
            this.slider && this.slider.updateOffsets({
              // left: this.center ? this.container.clientWidth / 2 - this.list.firstChild.clientWidth / 2 : 0,
              // right: this.center ? this.container.clientWidth / 2 - this.list.lastChild.clientWidth / 2 : 0,
              left: 0,
              right: 0,
              top: this.center ? this.container.clientHeight / 2 - this.list.firstChild.clientHeight / 2 : 0,
              bottom: this.center ? this.container.clientHeight / 2 - this.list.lastChild.clientHeight / 2 : 0,
            })
            this.slider && this.slider.updateMarker()
            this.slider && this.slider.goToIndex(this.current.index || 0, 0)

            this.isMounted = true
          }, 0)
        }, 0)
      }, 0)
    }, this.$el)
  },
  destroyed() {
    if (this.resizeObserver) this.resizeObserver.destroyResizeObserver()
  },
  methods: {
    onClickArrowPrev(event) {
      this.current.index = this.rtl ? this.slider.goToNext() : this.slider.goToPrev()
    },
    onClickArrowNext(event) {
      this.current.index = this.rtl ? this.slider.goToPrev() : this.slider.goToNext()
    },
    onClickDot(event, index) {
      this.current.index = this.goTo(index)
    },
    createSlider() {
      if (this.slider) this.slider.destroy()

      // init if needed
      // if (this.list.clientWidth > this.container.clientWidth) {
      this.slider = new Slider(this.list, {
        autoResize: false,
        center: this.center,
        container: this.container,
        lock: { x: true },
        mode: this.mode,
        offsets: {
          // left: this.center ? this.container.clientWidth / 2 - this.list.firstChild.clientWidth / 2 : 0,
          // right: this.center ? this.container.clientWidth / 2 - this.list.lastChild.clientWidth / 2 : 0,
          left: 0,
          right: 0,
          top: this.center ? this.container.clientHeight / 2 - this.list.firstChild.clientHeight / 2 : 0,
          bottom: this.center ? this.container.clientHeight / 2 - this.list.lastChild.clientHeight / 2 : 0,
        },
        overflowScrolling: this.overflowScrolling,
        snap: this.snap,

        //

        onMove: (x, y, element) => {
          this.current.x = x
          this.current.y = y
        },
        onComplete: () => {
          console.log('slider:onComplete')
        },
        onStart: () => {
          console.log('slider:onStart')
        },
        onEnd: () => {
          console.log('slider:onEnd')
        },
        onTranslate: (x, y, element, index, draggable) => {
          console.log('slider:onTranslate')
          this.current.index = index
          this.current.speed = draggable.speed
        },
        prevent(x, y) {
          return Math.abs(y) > 2
        },
      })

      // console.log('this.current.index', this.current.index)
      // setTimeout(() => {
      // this.goTo(this.current.index, 0)
      //   console.log('this.current.index2', this.current.index)
      // }, 0)
      // }
    },
    goTo(index, duration) {
      const targetElement = this.children.find((child, childIndex) => childIndex === index)

      return this.slider.goTo(targetElement, duration)
    },
    setTransition(enable = true) {
      this.list.style.setProperty('transition', enable ? 'transform 0.5s ease' : 'none')
    },
    updateStyles(styles) {
      setTimeout(() => {
        const parentWidth = this.container.clientWidth
        const trackWidth = this.children.reduce((acc, child) => (acc += child.getBoundingClientRect().width), 0)

        this.style = Object.assign({}, this.style, {
          '--parentWidth': `${parentWidth}px`,
          '--trackWidth': `${trackWidth}px`,
        }, styles)
      }, 0)
    },
  },
}
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
}

.grid {
  max-width: 80vw;
  margin: 0 auto;
}
</style>

<style lang="scss" scoped>
.slider {
  $root: &;

  position: relative;
  background: #eee;
  overflow: var(--overflow);
  margin: 50px auto;
  opacity: 0;
  transition: opacity 0.25s ease;

  &__region {
    /* Enable horizontal scrolling */
    overflow-x: visible;

    // &::after {
    //   content: '';
    //   position: absolute;
    //   width: 1px;
    //   height: 100%;
    //   background: red;
    //   top: 0;
    //   left: var(--anchorPosition);
    //   transform: translate3d(-50%,0,0);
    //   // mix-blend-mode: multiply;
    //   pointer-events: none;
    // }

    /* Enable horizontal scroll snap */
    // scroll-snap-type: x proximity;

    /* Smoothly snap from one focal point to another */
    // scroll-behavior: smooth;

    >ol,
    >ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }

  &__list {
    // padding: 0;
    // margin: 0;
    // list-style: none;
    display: flex;
    gap: var(--gap);
    width: calc(var(--trackWidth) + (var(--gap) * (var(--slidesCount) - 1)));
    // width: calc(var(--trackWidth) + (var(--gap) * (var(--slidesCount))));
    // width: calc(var(--trackWidth) + (var(--gap) * 1px));
    // transition: none;
    will-change: transform;
    transform: translate3d(0, 0, 0);
    // transition: transform 0.25s ease;
    backface-visibility: hidden;
    perspective: 1000;
    contain: paint;
    // justify-content: space-between;

    >* {
      background: #aaa;
    }

    figure {
      margin: 0;
      position: relative;
    }

    img,
    video {
      display: block;
      margin: 0 auto;
    }

    img {
      pointer-events: none;
      width: auto;
    }

    #{$root}--vertical & {
      flex-direction: column;
      width: 100%;
    }

    &-item {
      height: 300px;
      // flex: 1 1 auto;
      position: relative;
      // flex: 0 0 calc((var(--parentWidth) / var(--slidesToShow)) - var(--gap) - (var(--gap) / 2));
      // flex: 0 0 calc((var(--parentWidth) / var(--slidesToShow)) - var(--gap));
      // flex: 0 0 calc((var(--parentWidth) / var(--slidesToShow)) - var(--gap));
      // flex: 0 0 calc((var(--parentWidth) / var(--slidesToShow)) - 8px);
      // flex: 0 0 calc(var(--parentWidth) / var(--slidesToShow) - ((var(--gap) / 2) * var(--slidesToShow)) + (4px * (var(--slidesToShow) - 1)));
      flex: 0 0 calc(var(--parentWidth) / var(--slidesToShow) - var(--gap) + (var(--gap) / var(--slidesToShow)));
      // flex: 0 0 calc((var(--parentWidth) / var(--slidesToShow)));
      overflow: hidden;
      // filter: grayscale(100%);
      // filter: blur(5px);
      // opacity: 0.5;
      // transition: filter 0.5s ease-out, transform 0.5s ease-out;
      // // transform: translate3d(0,0,0) scale(0.75);
      // backface-visibility: hidden;

      &::after {
        content: attr(data-index);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 5vw;
        // top: 0;
        // left: 0;
        // height: 100%;
        // width: 100%;
      }

      img {
        width: 100%;
        object-fit: cover;
        // transform: translate3d(0,0,0);
        // backface-visibility: hidden;
        // visibility: hidden;
        // display: none;
      }

      &>*,
      & :is(figure, picture, img) {
        height: 100%;
        width: 100%;
        object-fit: cover;

        #{$root}--variable-width & {
          width: auto;
        }

        #{$root}--variable-height & {
          height: auto;
        }
      }

      &.current {
        // transform: translate3d(0,0,0) scale(1.1);
        // filter: grayscale(0%);
        // filter: blur(0);
        // transform: translate3d(0,0,0) scale(1.0);
      }

      #{$root}--variable-width & {
        flex: none;
        flex-basis: min-content;
      }

      #{$root}--variable-height & {
        flex: 0 0 auto;
        height: auto;
      }
    }
  }

  &__dots {
    display: flex;
    list-style: none;
    padding: 10px;
    margin: 0;
    justify-content: center;

    &-item {
      cursor: pointer;
      text-indent: -1000px;
      overflow: hidden;
      background: #333;
      border-radius: 100%;
      margin: 5px;
      // padding: 5px;
      height: 15px;
      width: 15px;
      opacity: 0.5;
      transition: opacity 0.25s ease;

      &--current {
        opacity: 1;
      }
    }
  }

  &__arrows {
    $root-arrow: &;

    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    overflow: hidden;
    pointer-events: none;

    &-prev,
    &-next {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: #333;
      color: white;
      padding: 20px;
      display: flex;
      align-content: center;
      justify-content: center;
      cursor: pointer;
      opacity: 1;
      direction: initial;
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: all;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.3);
      color: rgba(0, 0, 0, 0.3);
    }

    &-prev {
      left: 0;

      &#{$root-arrow}--disabled {
        transform: translate(-100%, -50%);
      }
    }

    &-next {
      right: 0;

      &#{$root-arrow}--disabled {
        transform: translate(100%, -50%);
      }
    }

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }

  &--is-mounted {
    opacity: 1;
  }
}

header {
  text-align: center;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.25em;
}

.subtitle {
  font-size: 1.25rem;
}

// .slideshow .slider__list-item {
//   /* Full-width slides, taller height */
//   height: 90vmin;
//   width: 100%;
// }

// .slider figcaption {
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   width: 100%;
//   padding: 0.25rem;
//   text-align: center;
//   background-color: hsl(0deg 0% 0% / 75%);
//   font-size: small;
// }

// .slider figcaption,
// .slider figcaption * {
//   color: white;
// }

// .slider-control {
//   --offset-x: 0.25rem;
//   cursor: pointer;

//   /* Anchor the controls relative to the outer wrapper */
//   position: absolute;

//   /* Center the controls vertically */
//   top: 50%;
//   padding: 1rem;
//   transform: translateY(-50%);
//   border-radius: 50%;
//   border: solid 1px hsl(0deg 0% 50%);
//   background-color: white;
//   color: black;
//   box-shadow: 0 0 16px 0 hsl(0deg 0% 0% / 20%);
//   line-height: 0;
// }

// .slider-control.start {
//   /* Same as left in LTR and right in RTL */
//   inset-inline-start: var(--offset-x);
// }

// .slider-control.end {
//   /* Same as right in LTR and left in RTL */
//   inset-inline-end: var(--offset-x);
// }

// [dir="rtl"] .slider-control:is(.start, .end) {
//   transform: translateY(-50%) scale(-1);
// }

// .slider-control[aria-disabled="true"] {
//   filter: opacity(0.5);
//   cursor: not-allowed;
// }
// }
</style>
