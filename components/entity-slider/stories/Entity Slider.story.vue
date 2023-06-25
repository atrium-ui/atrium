<docs lang="md">
## Use cases:

- image slider
- Overflowing tabs
- stepless gallary
</docs>

<script lang="ts" setup>
import "../src/index.js";
import { ref } from "vue";
import { Track } from "../src/index.js";

const centered = ref<Track>();

const centeredNext = () => {
  centered.value.moveBy(1);
};
const centeredPrev = () => {
  centered.value.moveBy(-1);
};
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="Default">
      <sv-track loop snap debug class="default">
        <div tabindex="0" class="cell" style="background: lime">1a</div>
        <div tabindex="0" class="cell">2a</div>
        <div tabindex="0" class="cell">3a</div>
        <div tabindex="0" class="cell">4a</div>
        <div tabindex="0" class="cell">5a</div>
        <div tabindex="0" class="cell">6a</div>
        <div tabindex="0" class="cell">7a</div>
        <div tabindex="0" class="cell">8a</div>
        <div tabindex="0" class="cell">9a</div>
        <div tabindex="0" class="cell">10a</div>
        <div class="cell ghost" style="background: orange">1b</div>
        <div class="cell ghost">2b</div>
        <div class="cell ghost">3b</div>
        <div class="cell ghost">4b</div>
        <div class="cell ghost">5b</div>
        <div class="cell ghost">6b</div>
        <div class="cell ghost">7b</div>
        <div class="cell ghost">8b</div>
        <div class="cell ghost">9b</div>
        <div class="cell ghost">10b</div>
      </sv-track>
    </Variant>

    <Variant title="Infinite">
      <sv-track loop class="infinite">
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
        <div class="cell ghost">1b</div>
        <div class="cell ghost">2b</div>
        <div class="cell ghost">3b</div>
        <div class="cell ghost">4b</div>
        <div class="cell ghost">5b</div>
        <div class="cell ghost">6b</div>
        <div class="cell ghost">7b</div>
        <div class="cell ghost">8b</div>
        <div class="cell ghost">9b</div>
        <div class="cell ghost">10b</div>
      </sv-track>
    </Variant>

    <Variant title="Full width">
      <div class="centered">
        <sv-track ref="centered" snap>
          <div class="cell">Home</div>
          <div class="cell">Not Home</div>
        </sv-track>

        <div class="arrow arrow-prev" @click="(e) => centeredPrev()">&lt;</div>
        <div class="arrow arrow-next" @click="(e) => centeredNext()">></div>
      </div>
    </Variant>

    <Variant title="Overflow">
      <sv-track class="overflow">
        <div class="cell">cell</div>
        <div class="cell">cell</div>
        <div class="cell">cell</div>
        <div class="cell">cell</div>
      </sv-track>
    </Variant>

    <Variant title="Tabs">
      <sv-track class="tabs">
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
      <sv-track class="special">
        <div class="cell first">1a</div>
        <div class="cell">2a</div>
        <div class="cell">3a</div>
        <div class="cell">4a</div>
        <div class="cell">5a</div>
        <div class="cell">6a</div>
        <div class="cell">7a</div>
        <div class="cell first ghost">1b</div>
        <div class="cell ghost">2b</div>
        <div class="cell ghost">3b</div>
        <div class="cell ghost">4b</div>
        <div class="cell ghost">5b</div>
        <div class="cell ghost">6b</div>
        <div class="cell ghost">7b</div>
      </sv-track>
    </Variant>
  </Story>
</template>

<style lang="scss" scoped>
.cell {
  width: 200px;
  height: 200px;
  box-shadow: inset 0 0 2px currentColor;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;

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

.centered {
  position: relative;

  .cell {
    width: 100%;
    height: 200px;
  }
}

.tabs {
  border: 1px solid #333;

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
  width: 200px;
  height: 120px;

  &.first {
    width: 320px;
  }
}
</style>
