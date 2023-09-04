<script lang="ts" setup>
import "../src/index";
</script>

<template>
  <Story group="primitives" icon-color="#8B5CF6">
    <Variant title="Radio">
      <a-select class="default">
        <button>Item 1</button>
        <button>Item 2</button>
        <button>Item 3</button>
        <button>Item 4</button>
      </a-select>
    </Variant>

    <Variant title="Multiple">
      <a-select class="multiple" multiple @change="(e) => console.log(e.target.value)">
        <button>Item 1</button>
        <button>Item 2</button>
        <button>Item 3</button>
        <button>Item 4</button>
      </a-select>
    </Variant>

    <Variant title="Slider Dots">
      <a-select class="dots">
        <button></button>
        <button></button>
        <button></button>
      </a-select>
    </Variant>
  </Story>
</template>

<style lang="scss" scoped>
a-select {
  margin: auto;
}

.default,
.multiple {
  button {
    border: none;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    border: 1px solid grey;
    cursor: pointer;
  }
  button[selected] {
    background: #8ecaec;
  }
  button:hover {
    filter: brightness(0.9);
  }
  button:active {
    transform: scale(0.985);
  }
}

.dots {
  margin: auto;
  display: flex;
  gap: 10px;

  button {
    padding: 0;
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
      background: #8ecaec;
    }
  }
}
</style>

<docs lang="md">
A functional helper element that sets an selected attribute on one or mutliple children by click.

Useful for accordions, tabs or filter selections for example.
</docs>
