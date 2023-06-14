<script>
import BaseTile from "./base/BaseTile.vue";

function easeInOutCirc(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutSine(x) {
  return Math.sin((x * Math.PI) / 2);
}

function timer(start, time) {
  // 0 - 1
  return Math.min((Date.now() - start) / time, 1);
}

export default {
  name: "TileSlider",
  components: { BaseTile },
  props: {
    tiles: {
      required: true,
      type: Array,
      default() {
        return [];
      },
    },
    defalutWidth: {
      required: false,
      type: Number,
      default: 7,
    },
    defaultSpeed: {
      required: false,
      type: Number,
      default: -1,
    },
    defaultTransitionTime: {
      required: false,
      type: Number,
      default: 669,
    },
    defaultPauesTransitionTime: {
      required: false,
      type: Number,
      default: 669,
    },
    defaultAutoplayTimeout: {
      required: false,
      type: Number,
      default: 2000,
    },
    defaultAutoplayTime: {
      required: false,
      type: Number,
      default: 3000,
    },
  },
  data() {
    return {
      width: this.defalutWidth,
      itemWidth: 480,
      speed: this.defaultSpeed,
      acceleration: 0,
      velocity: 0,
      lastTick: 0,
      targetXStart: null,
      targetX: null,
      targetEasing: "linear",
      positionX: 0,
      mouseX: 0,
      transitionAt: 0,
      pauseTransitionTime: this.defaultPauesTransitionTime,
      autoPlay: false,
      autoPlayTimeout: this.defaultAutoplayTimeout,
      autoPlayTime: this.defaultAutoplayTime,
      autoPlayTimer: null,
      transitionTime: this.defaultTransitionTime,
      currentCollumn: 0,
      paused: true,
      grabbing: false,
      scrollTimeout: null,
      canScroll: true,
      animation: null,
      tickRate: 1,
    };
  },
  mounted() {
    this.onMounted();
  },
  unmounted() {
    this.onUnmounted();
  },
  methods: {
    tile(x, y) {
      const index = x * 2 + y;
      return this.tiles[index];
    },
    isMobile() {
      return globalThis.innerWidth < 700;
    },
    getGridWidth() {
      return this.itemWidth * this.width;
    },
    format() {
      const firstCell = this.$el.querySelector(".tile");
      this.itemWidth = firstCell.clientWidth;

      if (this.isMobile()) {
        this.pause();
        this.autoPlay = true;
        this.moveBy(0, "linear");
        this.itemWidth = globalThis.innerWidth / 2;
      } else {
        this.autoPlay = false;
        this.unpause();

        if (globalThis.innerWidth < 1800) {
          this.itemWidth = 370;
        } else {
          this.itemWidth = 480;
        }
      }
    },
    pointerDown(e) {
      this.mouseX = e.x;
      this.setTarget(null);
      this.autoPlay = false;
    },
    pointerUp(e) {
      if (this.grabbing) {
        e.preventDefault();
      }

      if (this.isMobile() && this.grabbing) {
        this.moveBy(Math.abs(this.velocity) > 10 ? -Math.sign(this.velocity) : 0, "linear");
      }

      this.autoPlay = this.isMobile();

      this.grabbing = false;
      this.mouseX = 0;
    },
    pointerMove(e) {
      e.preventDefault();

      if (this.mouseX) {
        this.grabbing = true;
      }

      if (this.grabbing) {
        this.setPosition(this.positionX + (e.x - this.mouseX));
        this.mouseX = e.x;
        this.autoPlayTimer = Date.now() + this.autoPlayTimeout;
      }
    },
    onScroll() {
      clearTimeout(this.scrollTimeout);

      this.canScroll = false;

      this.scrollTimeout = setTimeout(() => {
        this.canScroll = true;
      }, 200);
    },
    onWheel(e) {
      if (this.paused && this.canScroll) {
        if (e.deltaX) {
          this.setPosition(this.positionX + -e.deltaX / 2);
          e.preventDefault();
        }
      }
    },
    pause() {
      this.paused = true;
      this.transitionAt = Date.now();
    },
    unpause() {
      this.paused = false;
      this.transitionAt = Date.now();
      this.setTarget(null);
    },
    setTarget(x, easing = "linear") {
      if (x !== null) {
        this.transitionAt = Date.now();
        this.targetXStart = this.positionX;
      }
      this.targetEasing = easing;
      this.targetX = x;
    },
    moveBy(columns, easing) {
      this.setTarget(-this.itemWidth * (this.currentCollumn + columns), easing);
    },
    setPosition(x) {
      const lastPositionX = this.positionX;
      this.positionX = x;
      this.velocity = this.positionX - lastPositionX;
    },
    stopAnimate() {
      cancelAnimationFrame(this.animation);
    },
    animate(ms = 0) {
      this.animation = requestAnimationFrame(this.animate);

      if (!this.lastTick) this.lastTick = ms;

      this.tickRate = ms - this.lastTick;
      this.lastTick = ms;

      this.update(this.tickRate);

      const track = this.$refs.track;
      if (track) {
        track.style.transform = `translateX(${this.positionX.toFixed(2)}px)`;
      }
    },
    update(deltaTick = 1) {
      deltaTick *= 0.01;

      this.positionX = this.positionX + this.acceleration || 0;

      // loop in front and back trait
      const maxX = -this.getGridWidth();
      this.positionX = this.positionX % maxX;
      if (this.positionX >= 0) {
        this.positionX = maxX;
      }

      this.currentCollumn = Math.abs(
        Math.round((this.positionX / this.getGridWidth()) * this.width)
      );

      // update mobile trait
      if (this.autoPlay) {
        const slideTime = timer(this.autoPlayTimer, this.autoPlayTime);
        if (slideTime >= 1) {
          this.moveBy(1, "ease");
          this.autoPlayTimer = Date.now();
        }
      }

      // update pause trait
      if (this.paused) {
        const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
        this.acceleration = this.speed * (1 - easeOutSine(transitionTime)) * (deltaTick * 10);
      } else {
        const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
        this.acceleration = this.speed * easeOutSine(transitionTime) * (deltaTick * 10);
      }

      // update target trait
      if (this.targetX !== null) {
        switch (this.targetEasing) {
          case "ease":
            {
              const transitionTime = timer(this.transitionAt, this.transitionTime);
              const easedDelta = (this.targetX - this.targetXStart) * easeInOutCirc(transitionTime);
              this.acceleration = this.targetXStart + easedDelta - this.positionX;
            }
            break;
          default:
            {
              const diff = (this.targetX - this.positionX) % maxX;
              this.acceleration = diff * deltaTick;
            }
            break;
        }
      }
    },
    onMounted() {
      this.format();
      this.animate();

      if ("PointerEvent" in window) {
        this.$el.addEventListener("pointermove", this.pointerMove.bind(this));
        this.$el.addEventListener("pointerdown", this.pointerDown.bind(this));
        this.$el.addEventListener("pointerup", this.pointerUp.bind(this));
        this.$el.addEventListener("pointercancel", this.pointerUp.bind(this));
        this.$el.addEventListener("pointerleave", this.pointerUp.bind(this));
      } else {
        this.$el.addEventListener("mousemove", this.pointerMove.bind(this));
        this.$el.addEventListener("mousedown", this.pointerDown.bind(this));
        this.$el.addEventListener("mouseup", this.pointerUp.bind(this));

        this.$el.addEventListener("touchmove", this.pointerMove.bind(this));
        this.$el.addEventListener("touchstart", this.pointerDown.bind(this));
        this.$el.addEventListener("touchend", this.pointerUp.bind(this));
        this.$el.addEventListener("touchcancel", this.pointerUp.bind(this));
      }

      window.addEventListener("resize", this.format.bind(this));
      window.addEventListener("scroll", this.onScroll.bind(this));
    },
    onUnmounted() {
      this.stopAnimate();

      if ("PointerEvent" in window) {
        this.$el.removeEventListener("pointermove", this.pointerMove.bind(this));
        this.$el.removeEventListener("pointerdown", this.pointerDown.bind(this));
        this.$el.removeEventListener("pointerup", this.pointerUp.bind(this));
        this.$el.removeEventListener("pointercancel", this.pointerUp.bind(this));
        this.$el.removeEventListener("pointerleave", this.pointerUp.bind(this));
      } else {
        this.$el.removeEventListener("mousemove", this.pointerMove.bind(this));
        this.$el.removeEventListener("mousedown", this.pointerDown.bind(this));
        this.$el.removeEventListener("mouseup", this.pointerUp.bind(this));

        this.$el.removeEventListener("touchmove", this.pointerMove.bind(this));
        this.$el.removeEventListener("touchstart", this.pointerDown.bind(this));
        this.$el.removeEventListener("touchend", this.pointerUp.bind(this));
        this.$el.removeEventListener("touchcancel", this.pointerUp.bind(this));
      }

      window.removeEventListener("resize", this.format.bind(this));
      window.removeEventListener("scroll", this.onScroll.bind(this));
    },
  },
};
</script>

<template>
  <div
    tabindex="0"
    class="tile-slider"
    :class="[grabbing ? 'tile-slider--grabbing' : undefined]"
    :style="{
      ['--width']: itemWidth.toFixed(2),
    }"
    @mouseenter="(e) => !isMobile() && pause()"
    @mouseleave="(e) => !isMobile() && unpause()"
    @wheel="onWheel"
  >
    <div class="tile-track" ref="track">
      <div v-for="(_, x) in width" :key="`1_x_${x}`" class="column">
        <template v-for="(_, y) in Math.round(tiles.length / width)">
          <BaseTile
            v-if="tile(x, y)"
            :key="`1_y_${y}`"
            class="cell"
            :icon="tile(x, y)?.icon"
            :color="tile(x, y)?.color"
            :background="tile(x, y)?.background"
            :href="tile(x, y)?.href"
            :text="tile(x, y)?.id"
          />
          <BaseTile
            v-else
            :key="`1_y_${y}`"
            class="cell"
            icon="DaDiDu_Logo"
            color="yellow"
            href="/"
            background="green"
          />
        </template>
      </div>

      <div v-for="(_, x) in width" :key="`2_x_${x}`" class="column ghost">
        <template v-for="(_, y) in Math.round(tiles.length / width)">
          <BaseTile
            v-if="tile(x, y)"
            :key="`1_y_${y}`"
            class="cell"
            :icon="tile(x, y)?.icon"
            :color="tile(x, y)?.color"
            :background="tile(x, y)?.background"
            :href="tile(x, y)?.href"
            :text="tile(x, y)?.id"
          />
          <BaseTile
            v-else
            :key="`1_y_${y}`"
            class="cell"
            icon="DaDiDu_Logo"
            color="yellow"
            href="/"
            background="green"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" global>
.tile-slider--grabbing {
  cursor: grabbing;

  .tile-track {
    pointer-events: none;
  }
}

.tile-slider {
  outline: none;
  overflow: hidden;
  touch-action: pan-y;

  .tile-track {
    display: flex;
    will-change: transform;
  }

  .cell.tile {
    width: calc(var(--width) * 1px);
    height: calc(var(--width) * 1px);
  }
}
</style>
