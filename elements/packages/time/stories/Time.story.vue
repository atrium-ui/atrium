<script lang="ts" setup>
import "../src/index.js";
</script>

<template>
  <Story>
    <div>
      This was loaded <a-time>{{ Date.now() }}</a-time>
    </div>
  </Story>
</template>

<style scoped>
div {
  font-family: sans-serif;
}
a-time {
  font-weight: bold;
}
</style>

<docs lang="md">
# Time

This small component will render a timestamp into a self updating timer with localised format.

## Locales

If this component does not support the locales you need, please contribute them.

Supported:

- English
- Deutsch
- 한국어
</docs>
