# svg-sprites

Compile svgs in a directory to a spritesheet and make it available as text or blob.

Includes a CustomElement that makes it easy to use any icon.

```html
<svg-icon icon="speaker" />
```

Or SSR the SVG symbols into the page.

```typescript
import { svg } from 'svg-sprites/sheet';
```

```html
// nuxt
<template>
  <NuxtLayout name="default">
    <div style="display: none" v-html="svgIcons"></div>

    <NuxtPage />
  </NuxtLayout>
</template>
```

## Vite configuration

```typescript
import svgSprite from "svg-sprites/vite";

export default {
  plugins: [
    svgSprite({ dir: ["assets/icons/*.svg"] }),
  ],
};
```

## Next / Webpack configuration

```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  webpack(config, options) {
    config.module.rules.push({
      use: [
        {
          loader: "svg-sprites/loader",
          options: {
            dir: "./assets/icons/*.svg",
          },
        },
      ],
    });

    return config;
  },
};
```

## Component Usage

Place your SVG files in a directory of choice, by default `/assets/icons/**/*.svg`.

```typescript
// import component
import "svg-sprites/svg-icon";
// ...
```

```html
// use in html
<body>
  <svg-icon icon="speaker" />
</body>
```


## Features/Issues TODO:
- replace string, for replacing a hex color with currentColor for example.
- make sure globs use the correct cwd
- provide an export with a Map of all the symbols to use in JS
- import svg as jsx component?
- generate types for icon names
