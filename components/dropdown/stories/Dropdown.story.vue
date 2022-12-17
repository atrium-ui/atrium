<script lang="ts" setup>
import "@atrium-ui/mono/components/dropdown";
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
  <Story title="Dropdown" :layout="{ type: 'single', iframe: true }">
    <Variant title="Default">
      <aui-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
      >
        <button slot="input">{{ state.value || "Select" }}</button>

        <aui-option>Option 1</aui-option>
        <aui-option>Option 2</aui-option>
        <aui-option>Option 3</aui-option>
        <aui-option>Option 4</aui-option>
        <aui-option>Option 5</aui-option>
        <aui-option>Option 6</aui-option>
        <aui-option>Option 7</aui-option>
        <aui-option>Option 8</aui-option>
        <aui-option>Option 9</aui-option>
        <aui-option>Option 10</aui-option>
      </aui-dropdown>
    </Variant>

    <Variant title="Flyup">
      <aui-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
        direction="up"
        style="margin-top: 300px"
      >
        <button slot="input">{{ state.value || "Select" }}</button>

        <aui-option>Option 1</aui-option>
        <aui-option>Option 2</aui-option>
        <aui-option>Option 3</aui-option>
        <aui-option>Option 4</aui-option>
        <aui-option>Option 5</aui-option>
        <aui-option>Option 6</aui-option>
        <aui-option>Option 7</aui-option>
        <aui-option>Option 8</aui-option>
      </aui-dropdown>
    </Variant>

    <Variant title="Text Filter">
      <aui-dropdown
        @select="handleSelect"
        @open="logEvent('Open', e)"
        @close="logEvent('Close', e)"
      >
        <input slot="input" v-model="state.value" @input="handleFilter" placeholder="Text" />

        <aui-option
          v-for="option of exampleOptions.filter((opt) =>
            state.value
              ? opt.toLocaleLowerCase().indexOf(state.value.toLocaleLowerCase()) !== -1
              : true
          )"
          :key="option"
          :value="option"
          >{{ option }}</aui-option
        >
      </aui-dropdown>
    </Variant>

    <!-- // Vareints of dropdowns  -->
  </Story>
</template>

<docs lang="md">
Universal dropdown component

## Properties

```tsx
// If the dropdown should open upwards or downwards
<aui-dropdown direction: 'down' | 'up'; />
```

```tsx
// The value or index of the selected option
// If the option does not have a 'value' attribute, indexes will be used.
<aui-dropdown selected: String; />
```

```tsx
// Open state of the dropdown
<aui-dropdown opened: Boolean; />
```

```tsx
// Prevents the dropdown from opening
<aui-dropdown disabled: Boolean; />
```

## Events

```tsx
// Emitted after the dropdown closed
<aui-dropdown @close />
```

```tsx
// Emitted *before* the dropdown opens
<aui-dropdown @open />
```

```tsx
// Emitted after a option has been slected by Click or Enter key
<aui-dropdown @select: ({ option: OptionElement; }) => void />
```
</docs>
