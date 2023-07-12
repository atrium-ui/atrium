<docs lang="md">
## Use cases:

- image slider
- Overflowing tabs
- stepless gallary
</docs>

<script lang="ts" setup>
import { ref } from "vue";
import "../../select/src/index.js";
import "../src/index.js";

const centeredSliderIndex = ref([0]);
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="Default">
      <sv-track class="default">
        <div tabindex="0" class="cell">1a</div>
        <div tabindex="0" class="cell">2a</div>
        <div tabindex="0" class="cell">3a</div>
        <div tabindex="0" class="cell">4a</div>
        <div tabindex="0" class="cell">5a</div>
        <div tabindex="0" class="cell">6a</div>
        <div tabindex="0" class="cell">7a</div>
        <div tabindex="0" class="cell">8a</div>
        <div tabindex="0" class="cell">9a</div>
        <div tabindex="0" class="cell">10a</div>
      </sv-track>
    </Variant>

    <Variant title="Infinite">
      <sv-track loop class="infinite">
        <div tabindex="0" class="cell">1</div>
        <div tabindex="0" class="cell">2</div>
        <div tabindex="0" class="cell">3</div>
        <div tabindex="0" class="cell">4</div>
        <div tabindex="0" class="cell">5</div>
        <div tabindex="0" class="cell">6</div>
        <div tabindex="0" class="cell">7</div>
        <div tabindex="0" class="cell">8</div>
        <div tabindex="0" class="cell">9</div>
        <div tabindex="0" class="cell">10</div>
      </sv-track>
    </Variant>

    <Variant title="Centered">
      <div class="centered">
        <sv-track
          ref="centeredSlider"
          snap
          @change="
            (e) => {
              centeredSliderIndex = e.detail;
            }
          "
        >
          <!-- Give these cells a ratio box -->
          <div class="cell">Home</div>
          <div class="cell">Not Home</div>
          <div class="cell">Their Home</div>
        </sv-track>

        <sv-select
          class="dots"
          :value="[centeredSliderIndex]"
          @input="
            (e) => {
              const track = $refs.centeredSlider;
              track.moveTo(+e.target.value, 'ease');
              e.preventDefault();
            }
          "
        >
          <button></button>
          <button></button>
          <button></button>
        </sv-select>

        <div class="arrow arrow-prev" @click="(e) => $refs.centeredSlider.moveBy(-1)">
          &lt;
        </div>
        <div class="arrow arrow-next" @click="(e) => $refs.centeredSlider.moveBy(1)">
          >
        </div>
      </div>
    </Variant>

    <Variant title="Overflow Scroll">
      <sv-track snap overflowscroll class="overflow">
        <div class="inner">
          <div class="cell">cell</div>
        </div>
        <div class="inner">
          <div class="cell">cell</div>
        </div>
        <div class="inner">
          <div class="cell">cell</div>
        </div>
        <div class="inner">
          <div class="cell">cell</div>
        </div>
      </sv-track>
    </Variant>

    <Variant title="Tabs">
      <sv-track class="tabs" overflow="fill" overflowscroll>
        <div class="cell">Home</div>
        <div class="cell">Videos</div>
        <div class="cell">Career</div>
        <div class="cell">Projects</div>
        <div class="cell">About</div>
        <div class="cell">Lorem</div>
        <div class="cell">Ipsum</div>
      </sv-track>
    </Variant>

    <Variant title="Variable item width">
      <sv-track class="special" overflow="fill">
        <div class="cell first">1a</div>
        <div class="cell">2a</div>
        <div class="cell">3a</div>
        <div class="cell">4a</div>
        <div class="cell">5a</div>
        <div class="cell">6a</div>
        <div class="cell">7a</div>
      </sv-track>
    </Variant>

    <Variant title="Vertical">
      <sv-track class="vertical" vertical>
        <div class="cell first">1a</div>
        <div class="cell">2a</div>
        <div class="cell">3a</div>
        <div class="cell">4a</div>
        <div class="cell">5a</div>
        <div class="cell">6a</div>
        <div class="cell">7a</div>
        <div class="cell">8a</div>
        <div class="cell">9a</div>
        <div class="cell">10a</div>
        <div class="cell">11a</div>
        <div class="cell">12a</div>
        <div class="cell">13a</div>
        <div class="cell">14a</div>
        <div class="cell">15a</div>
      </sv-track>
    </Variant>
  </Story>
</template>

<style lang="scss" scoped>
.cell {
  overflow: hidden;
  width: 200px;
  height: 200px;
  box-shadow: inset 0 0 2px currentColor;
  border-radius: 4px;
  padding: 4px;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;

  &[active] {
    background: #f7f7f7;
  }

  &:hover {
    background: #f7f7f7;
  }
}

.arrow {
  position: absolute;
  border-radius: 50%;
  background: #eeeeee47;
  border: 1px solid #eee;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;

  &:hover {
    background: #eee;
  }

  &.arrow-next {
    right: 15px;
  }

  &.arrow-prev {
    left: 15px;
  }
}

.default .cell {
  user-select: none;
  width: 320px;
  height: 320px;
  color: lime;
  font-size: 42px;
  font-weight: 600;
}

.infinite {
  padding-left: calc(50% - 100px);
}

.centered {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  --width: 600px;

  sv-track {
    padding-left: calc(50% - (var(--width) / 2));
  }

  .cell {
    width: var(--width);
    aspect-ratio: 2;
    height: auto;

    & > * {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .dots {
    margin: auto;
    margin-top: 10px;
    display: flex;
    gap: 10px;

    button {
      display: block;
      background: #eee;
      border-radius: 50%;
      border: none;
      width: 12px;
      height: 12px;
      cursor: pointer;
      opacity: 0.75;

      &[selected] {
        opacity: 1;
        background: rgb(212, 212, 212);
      }
    }
  }
}

.tabs {
  .cell {
    flex: none;
    width: 130px;
    height: 60px;
    font-size: 24px;
    text-align: center;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 10px;

    &:active {
      background: #eee;
    }
  }
}

.special .cell {
  flex: none;
  width: 320px;
  height: 320px;

  &.first {
    width: 600px;
  }
}

.overflow {
  .cell {
  }

  .inner {
    padding: 8px;

    &[active] .cell {
      border: 2px solid red;
    }
  }
}

.vertical {
  height: 600px;

  .cell {
    height: 100px;
  }
}
</style>
