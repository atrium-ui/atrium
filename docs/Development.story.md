---
group: 'docs'
icon: 'carbon:template'
title: 'Development'
---

# Development

## Lit

We use the lit library to simplify development of WebComponents. It provieds fast html template rendering and reactive state.

[https://lit.dev/docs/](https://lit.dev/docs/)

## Useful VSCode addons

- [eslint](vscode:extension/dbaeumer.vscode-eslint)
- [prettier](vscode:extension/esbenp.prettier-vscode)
- [Prettier ESLint](vscode:extension/rvest.vs-code-prettier-eslint)
- [lit-plugin](vscode:extension/runem.lit-plugin)

## Use in Frameworks

### Nuxt3

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@atrium-ui/mono"]
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
import '@atrium-ui/mono/components/accordion';
```

### NextJS

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@atrium-ui/mono"]
  }
}
```

```typescript
// pages/index.tsx
if (typeof window !== "undefined") {
  // only import on client render;
  // This will not cause hydration errors,
  //  since the components dont render any html in itself.
  import("@atrium-ui/mono/components/accordion");
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
    "types": ["@atrium-ui/mono"]
  }
}
```

```typescript
// /declaration.d.ts
import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements extends AtriumElements {}
  }
}
```

```typescript
// App.tsx
import "@atrium-ui/mono/components/accordion";

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


## Branches

### `dev`
is a published branch for development versions.

### `main`
is a publish branch for production versions.

### `develop`
is a development branch. This branch will be merged into `main` when a new production version will be published.

### `component/<component-id>`
is a feature branch for a single component. Theses will be merged into `develop`;
