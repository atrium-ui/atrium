---
group: "docs"
icon: "carbon:assembly-reference"
title: "Installation"
---

https://docs.gitlab.com/ee/user/packages/npm_registry/#install-from-the-instance-level

1. Update or create .npmrc file

```ini
# .npmrc
@sv:registry=https://gitlab.s-v.de/api/v4/packages/npm/
'//gitlab.s-v.de/api/v4/packages/npm/:_authToken'="glpat-FMDSCh9zyLK4vS6kd4JB"
```

2. Install the library like this

```bash
npm i @sv/mono
```

3.1 Import a component

```typescript
import "@sv/elements/a-component";
```

3.1.2 Use it any framework:

```tsx
<a-component some-prop="some"></a-component>
```

3.2 Or use a ready to use component

```bash
npx atrium use <component>
```

# Usage

## TypeScript

Every WebComponent is written in TypeScript, that means we can autocomplete and suggest props.

![proptype.jpg](./images/proptype.jpg)

### Type declarations for different Frameworks

Types for Custom Elements are privded with the `CustomElements` interface of this module.
By default types for React (Solid.JS, Next.JS) and Vue are provided.

For more details check the `types/index.d.ts` type declaration file.

## Styling

All UI Components come with some default default styling. All Styling works on a opt-in basis.
So to use the default styling, u need to import the provided `<component>/styles/default.scss` yourself.

## Use in Frameworks

### Nuxt3

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@sv/mono"]
  }
}
```

```vue
// pages/index.vue
<template>
  <aui-accordion-item>
    <div slot="title">Title</div>
    <div>Content</div>
  </aui-accordion-item>
</template>
```

```typescript
import "@sv/mono/components/accordion";
```

### NextJS

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@sv/mono"]
  }
}
```

```typescript
// pages/index.tsx
if (typeof window !== "undefined") {
  // only import on client render;
  // This will not cause hydration errors,
  //  since the components dont render any html in itself.
  import("@sv/mono/components/accordion");
}

export default function Home() {
  return (
    <main>
      <aui-accordion-item>
        <div slot="title">Title</div>
        <div>Content</div>
      </aui-accordion-item>
    </main>
  );
}
```

### SolidJS

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@sv/mono"]
  }
}
```

```typescript
// /declaration.d.ts
import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements extends CustomElements {}
  }
}
```

```typescript
// App.tsx
import "@sv/elements/accordion";

const App: Component = () => {
  return (
    <aui-accordion-item>
      <div slot="title">Title</div>
      <div>Contentx</div>
    </aui-accordion-item>
  );
};

export default App;
```

## Support

[Can I use](https://caniuse.com/mdn-api_window_customelements)
Support for WebComponents exists in major browsers since around 2018.
![Support table](./images/support.jpg)
[More information here](https://www.webcomponents.org/)
