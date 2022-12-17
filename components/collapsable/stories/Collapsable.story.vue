<script lang="ts" setup>
import "@atrium-ui/mono/components/collapsable";

// import { hstEvent } from "histoire/client";
// import { reactive } from "vue";
// import { paragraph } from "txtgen";

const toggleOpen = () => {
  state.opened = !state.opened;
};

const state = reactive({
  opened: false,
  p1: paragraph(4),
  p2: paragraph(4),
});
</script>

<template>
  <Story group="primitives">
    <Variant title="text">
      <p>
        {{ state.p1 }}
      </p>

      <aui-collapsable @item-opened-change="hstEvent('open change', $event)" :opened="state.opened">
        <p>
          {{ state.p2 }}
        </p>
      </aui-collapsable>

      <div class="foot">
        <button @click="toggleOpen">{{ state.opened ? "show less" : "show more" }}</button>
      </div>

      <template #controls>
        <HstCheckbox title="Opened" v-model.number="state.opened" />
      </template>
    </Variant>
    <Variant title="list">
      <ul>
        <li>Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes</li>
        <li>Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes</li>
        <li>Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes</li>
      </ul>

      <aui-collapsable @item-opened-change="hstEvent('open change', $event)" :opened="state.opened">
        <ul>
          <li>Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes</li>
        </ul>
      </aui-collapsable>

      <div class="foot">
        <button @click="toggleOpen">{{ state.opened ? "show less" : "show more" }}</button>
      </div>

      <template #controls>
        <HstCheckbox title="Opened" v-model.number="state.opened" />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
button {
  text-align: center;
  margin: auto;
}
.foot {
  display: flex;
  justify-content: center;
}
</style>

<docs lang="md">
# collapsable

A more basic element of an accordion that only includes the animation and scroll behavios for collapsable content.

## Properties

```typescript
// Opened or closed (read and write)
<aui-collapsable opened: Boolean; />
```
</docs>
