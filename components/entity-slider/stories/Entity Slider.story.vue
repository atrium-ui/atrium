<docs lang="md">
## Use cases:

- image slider
- Overflowing tabs
- stepless gallary
</docs>

<script lang="ts" setup>
import "../src/index.js";
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="Default">
      <sv-track loop snap class="default">
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
      <sv-track class="infinite">
        <div class="cell first">Home</div>
      </sv-track>
    </Variant>

    <Variant title="Centered">
      <sv-track class="centered">
        <div class="cell first">Home</div>
      </sv-track>
    </Variant>

    <Variant title="Stepped">
      <sv-track class="stepped">
        <div class="cell first">Home</div>
      </sv-track>

      <div class="arrow arrow-prev">&lt;</div>
      <div class="arrow arrow-next">></div>
    </Variant>

    <Variant title="Overflow">
      <sv-track class="overflow">
        <div class="cell first">Home</div>
      </sv-track>
    </Variant>

    <Variant title="Tabs">
      <sv-track class="tabs">
        <div class="cell first">Home</div>
        <div class="cell">Videos</div>
        <div class="cell">Career</div>
        <div class="cell">Projects</div>
        <div class="cell">About</div>
        <div class="cell">Lorem</div>
        <div class="cell">Ipsum</div>
      </sv-track>
    </Variant>

    <Variant title="Special">
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
sv-track {
  margin: 20px;
}

.cell {
  box-shadow: inset 0 0 2px currentColor;

  &:hover {
    background: #f7f7f7;
  }
}

.default .cell {
  user-select: none;
  width: 320px;
  height: 320px;
  flex: none;
  display: flex;
  justify-content: center;
  align-items: center;
  color: lime;
  font-size: 42px;
  font-weight: 600;
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
