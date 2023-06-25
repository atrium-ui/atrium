<script>
import BaseTile from "./base/BaseTile.vue";

const Ease = {
  easeInOutCirc(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  },
  easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
  },
};

export function timer(start, time) {
  // 0 - 1
  return Math.min((Date.now() - start) / time, 1);
}

export class Trait {
  entity;

  constructor(entity) {
    this.entity = entity;
  }

  update(deltaTick) {}

  input(input) {}
}

class AutoplayTrait extends Trait {
  update(deltaTick) {
    const entity = this.entity;
    if (entity.autoPlay) {
      const slideTime = timer(entity.autoPlayTimer, entity.autoPlayTime);
      if (slideTime >= 1) {
        entity.moveBy(1, "ease");
        entity.autoPlayTimer = Date.now();
      }
    }
  }
}

class PausedTrait extends Trait {
  update(deltaTick) {
    const entity = this.entity;
    if (!entity.paused) {
      const transitionTime = timer(entity.transitionAt, entity.pauseTransitionTime);
      entity.acceleration = entity.speed * Ease.easeOutSine(transitionTime) * (deltaTick * 10);
    }
  }
}

class TargetTrait extends Trait {
  update(deltaTick) {
    const entity = this.entity;
    if (entity.targetX !== null) {
      const maxX = -entity.getGridWidth();

      switch (entity.targetEasing) {
        case "ease":
          {
            const transitionTime = timer(entity.transitionAt, entity.transitionTime);
            const easedDelta =
              (entity.targetX - entity.targetXStart) * Ease.easeInOutCirc(transitionTime);
            entity.acceleration = entity.targetXStart + easedDelta - entity.positionX;
          }
          break;
        default:
          {
            const diff = (entity.targetX - entity.positionX) % maxX;
            entity.acceleration = diff * deltaTick;
          }
          break;
      }
    }
  }
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
      default: 1500,
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
      inputs: [],
      // prettier-ignore
      traits: [
        new AutoplayTrait(this),
        new PausedTrait(this),
        new TargetTrait(this)
      ],
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

    isTouch() {
      return navigator.maxTouchPoints || "ontouchstart" in window;
    },

    getGridWidth() {
      return this.itemWidth * this.width;
    },

    format() {
      const firstCell = this.$el.querySelector(".tile");
      this.itemWidth = firstCell.clientWidth;

      if (globalThis.innerWidth < 700) {
        this.itemWidth = globalThis.innerWidth / 2;
      } else if (globalThis.innerWidth < 1800) {
        this.itemWidth = 370;
      } else {
        this.itemWidth = 480;
      }

      if (this.isTouch()) {
        this.pause();
        this.autoPlay = true;
        this.moveBy(0, "linear");
      } else {
        this.autoPlay = false;
        this.unpause();
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

      if (this.isTouch() && this.grabbing) {
        this.moveBy(Math.abs(this.acceleration) > 5 ? -Math.sign(this.acceleration) : 0, "linear");
      }

      this.autoPlay = this.isTouch();

      this.mouseX = 0;
      this.grabbing = false;
    },

    pointerMove(e) {
      e.preventDefault();

      if (this.mouseX) {
        this.grabbing = true;
      }

      if (this.grabbing) {
        this.inputs.push({
          deltaX: e.x - this.mouseX,
        });
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
          this.acceleration = -e.deltaX;
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

    stopAnimate() {
      cancelAnimationFrame(this.animation);
    },

    animate(ms = 0) {
      this.animation = requestAnimationFrame(this.animate);

      if (!this.lastTick) this.lastTick = ms;

      this.tickRate = ms - this.lastTick;
      this.lastTick = ms;

      // handle inputs synchronously
      this.handleInputs();

      this.update(this.tickRate * 0.01);

      const track = this.$refs.track;
      if (track) {
        track.style.transform = `translateX(${this.positionX.toFixed(2)}px)`;
      }
    },

    handleInputs() {
      let inputAcceleration = 0;

      // TODO: use inputs array for all type of inputs
      for (const input of this.inputs) {
        inputAcceleration += input.deltaX;

        for (const trait of this.traits) {
          trait.input(this.tickRate);
        }
      }
      this.inputs.length = 0;
      if (inputAcceleration) this.acceleration = inputAcceleration;
    },

    update(deltaTick = 1) {
      this.positionX = this.positionX + this.acceleration;

      this.acceleration *= 0.9; // drag

      // loop in front and back trait
      const maxX = -this.getGridWidth();
      this.positionX = this.positionX % maxX;
      if (this.positionX >= 0) {
        this.positionX = maxX;
      }

      this.currentCollumn = Math.abs(
        Math.round((this.positionX / this.getGridWidth()) * this.width)
      );

      for (const trait of this.traits) {
        trait.update(deltaTick);
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
    @mouseenter="(e) => !isTouch() && pause()"
    @mouseleave="(e) => !isTouch() && unpause()"
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
