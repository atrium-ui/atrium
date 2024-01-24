<template>
  <div class="dragger">
    <div class="dragger__items">
      <template v-for="(config, index) in configs">
        <div :key="index" class="simple">
          <div ref="tracks" class="track">
            <!-- <div ref="drags" class="drag drag-large-v drag-large-h"> -->
            <div ref="drags" class="drag">
              drag me
            </div>
          </div>

          <hgroup v-if="variants[index]">
            <h4>
              {{ getVariantHeadline(variants[index].options) }}
            </h4>
            <h5>
              <code>{{ JSON.stringify(variants[index].options) }}</code>
            </h5>
          </hgroup>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Draggable from '../dragger.debug.js'

export default {
  data() {
    return {
      configBase: {
        alignX: 'inner',
        alignY: 'inner',
        // lock: { x: false, y: true },
        overflowScrolling: true,
        onMove: (event, slider) => requestAnimationFrame(() => { slider.element.style.transform = `translate3d(${slider.drag.x}px, ${slider.drag.y}px, 0)` }),
        // onTranslate: () => { console.log('onTranslate') },
        prevent: (x, y) => true,
      },
      configs: [
        { offsets: { left: 50, right: 50, top: 50, bottom: 50 } },
        { offsets: { left: 50, right: 50, top: 50, bottom: 50 }, overflowScrolling: false },
        { offsets: { left: 50, right: 50, top: 50, bottom: 50 }, alignX: 'outer', alignY: 'outer' },
        { offsets: { left: 50, right: 50, top: 50, bottom: 50 }, overflowScrolling: false, alignX: 'outer', alignY: 'outer' },

        //

        { offsets: { left: 202, right: 202, top: 202, bottom: 202 } },
        { offsets: { left: 202, right: 202, top: 202, bottom: 202 }, overflowScrolling: false },
        { offsets: { left: 202, right: 202, top: 202, bottom: 202 }, alignX: 'outer', alignY: 'outer' },
        { offsets: { left: 202, right: 202, top: 202, bottom: 202 }, overflowScrolling: false, alignX: 'outer', alignY: 'outer' },

        //

        { offsets: { left: 155, right: 155, top: 155, bottom: 155 } },
        { offsets: { left: 155, right: 155, top: 155, bottom: 155 }, overflowScrolling: false },
        { offsets: { left: 155, right: 155, top: 155, bottom: 155 }, alignX: 'outer', alignY: 'outer' },
        { offsets: { left: 155, right: 155, top: 155, bottom: 155 }, overflowScrolling: false, alignX: 'outer', alignY: 'outer' },

        //

        { offsets: { left: 0, right: 0, top: 0, bottom: 0 } },
        { offsets: { left: 0, right: 0, top: 0, bottom: 0 }, overflowScrolling: false },
        { offsets: { left: 0, right: 0, top: 0, bottom: 0 }, alignX: 'outer', alignY: 'outer' },
        { offsets: { left: 0, right: 0, top: 0, bottom: 0 }, overflowScrolling: false, alignX: 'outer', alignY: 'outer' },
      ],
      variants: [],
    }
  },
  mounted() {
    // set first two configs offsets to container center
    this.configs[4].offsets = { left: this.$refs.tracks[4].clientWidth / 2, right: this.$refs.tracks[4].clientWidth / 2, top: 0, bottom: 0 }
    this.configs[5].offsets = { left: this.$refs.tracks[5].clientWidth / 2, right: this.$refs.tracks[5].clientWidth / 2, top: 0, bottom: 0 }
    this.configs[6].offsets = { left: this.$refs.tracks[6].clientWidth / 2, right: this.$refs.tracks[6].clientWidth / 2, top: 0, bottom: 0 }
    this.configs[7].offsets = { left: this.$refs.tracks[7].clientWidth / 2, right: this.$refs.tracks[7].clientWidth / 2, top: 0, bottom: 0 }

    this.configs.forEach((config, index) => {
      this.variants.push(new Draggable(this.$refs.drags[index], Object.assign({}, this.configBase, config)))
    })
  },
  methods: {
    getVariantHeadline(variant) {
      return Object.keys(variant).filter(key => {
        return variant[key] !== false && !key.startsWith('on')
      }).join(' - ')
    },
  },
}
</script>

<style lang="scss" scoped>
.dragger {
  overflow: hidden;

  &__items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 1vw;

    >* {
      // float: left;
      // overflow: hidden;
      // height: 300px;
      width: 300px;

      .track {
        height: 300px;
        width: 100%;
        background: yellow;
      }

      .drag {
        transform: translate3d(var(--transformX), var(--transformY), 0);
        height: 25%;
        width: 25%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: red;
        user-select: none;

        &-large-h {
          width: 49vw;
        }

        &-large-v {
          height: 60vw;
        }
      }

      h3,
      code {
        width: 100%;
        word-break: break-all;
      }
    }
  }
}
</style>
