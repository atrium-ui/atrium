---
group: 'docs'
icon: 'carbon:assembly-reference'
title: 'TypeScript'
---

# TypeScript

Every WebComponent is written in TypeScript, that means we can autocomplete and suggest props.

![proptype.jpg](./images/proptype.jpg)

## Type declarations for different Frameworks

### Solid JS
```typescript
// declaration.d.ts
import "solid-js";
// augment custom elements
declare module "solid-js" {
  namespace JSX {
    type ElementProps<T> = {
      [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
    };
    type Props<T> = {
      [K in keyof Omit<T, "children"> as string & K]?: T[K];
    };
    interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
  }
}
```

### React
```typescript
// declaration.d.ts
namespace JSX {
  type ElementProps<T> = {
    [K in keyof T]: Props<T[K]>;
  };
  type Props<T> = {
    [K in keyof T & { children: Element[] } as string & K]?: T[K];
  };
  interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
}
```

### Nuxt
is bad at TypeScript.
