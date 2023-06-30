<script lang="ts" setup>
import "../src/index.js";
import "../styles/default.scss";

import { logEvent } from "histoire/client";
import { reactive } from "vue";

const state = reactive({
  value: "",
});

const handleSelect = (e) => {
  state.value = e.option.innerText;
  logEvent("Select Option", e);
};

const exampleOptions = [
  "Option 1",
  "Option 2",
  "Option 3",
  "Some Option",
  "Another Option",
  "Another Option 2",
  "Another Option 3",
  "Option 6",
  "Item 7",
  "Item 8",
];
</script>

<template>
  <Story title="Dropdown">
    <Variant title="Default">
      <a-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
        style="margin-bottom: 300px"
      >
        <button slot="input">{{ state.value || "Select" }}</button>

        <a-option>Option 1</a-option>
        <a-option>Option 2</a-option>
        <a-option>Option 3</a-option>
        <a-option>Option 4</a-option>
        <a-option>Option 5</a-option>
        <a-option>Option 6</a-option>
        <a-option>Option 7</a-option>
        <a-option>Option 8</a-option>
        <a-option>Option 9</a-option>
        <a-option>Option 10</a-option>
      </a-dropdown>
    </Variant>

    <Variant title="Flyup">
      <a-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
        direction="up"
        style="margin-top: 300px"
      >
        <button slot="input">{{ state.value || "Select" }}</button>

        <a-option>Option 1</a-option>
        <a-option>Option 2</a-option>
        <a-option>Option 3</a-option>
        <a-option>Option 4</a-option>
        <a-option>Option 5</a-option>
        <a-option>Option 6</a-option>
        <a-option>Option 7</a-option>
        <a-option>Option 8</a-option>
      </a-dropdown>
    </Variant>

    <Variant title="Text Filter">
      <a-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
        style="margin-bottom: 300px"
      >
        <input
          slot="input"
          v-model="state.value"
          @input="handleFilter"
          placeholder="Text"
        />

        <a-option
          v-for="option of exampleOptions.filter((opt) =>
            state.value
              ? opt.toLocaleLowerCase().indexOf(state.value.toLocaleLowerCase()) !== -1
              : true
          )"
          :key="option"
          :value="option"
          >{{ option }}</a-option
        >
      </a-dropdown>
    </Variant>

    <!-- // Vareints of dropdowns  -->
  </Story>
</template>

<docs lang="md">
Universal dropdown component

## Properties

```tsx
// If the dropdown should open upwards or downwards
<a-dropdown direction: 'down' | 'up'; />
```

```tsx
// The value or index of the selected option
// If the option does not have a 'value' attribute, indexes will be used.
<a-dropdown selected: String; />
```

```tsx
// Open state of the dropdown
<a-dropdown opened: Boolean; />
```

```tsx
// Prevents the dropdown from opening
<a-dropdown disabled: Boolean; />
```

## Events

```tsx
// Emitted after the dropdown closed
<a-dropdown @close />
```

```tsx
// Emitted *before* the dropdown opens
<a-dropdown @open />
```

```tsx
// Emitted after a option has been slected by Click or Enter key
<a-dropdown @select: ({ option: OptionElement; }) => void />
```
</docs>
