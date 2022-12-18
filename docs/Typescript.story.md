---
group: 'docs'
icon: 'carbon:assembly-reference'
title: 'TypeScript'
---

# Type declarations for different Frameworks

## Solid JS
```typescript
// declaration.d.ts
import "solid-js";
// augment custom elements
declare module "solid-js" {
  namespace JSX {
    type ElementProps<T> = {
      // Add both the element's prefixed properties and the attributes
      [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
    };
    // Prefixes all properties with `prop:` to match Solid's property setting syntax
    type Props<T> = {
      [K in keyof Omit<T, "children"> as `${string & K}`]?: T[K];
    };
    interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
  }
}
```

## React
```typescript
// declaration.d.ts
declare global {
  namespace JSX {
    type ElementProps<T> = {
      // Add both the element's prefixed properties and the attributes
      [K in keyof T]: Props<T[K]> & HTMLAttributes<T[K]>;
    };
    // Prefixes all properties with `prop:` to match Solid's property setting syntax
    type Props<T> = {
      [K in keyof Omit<T, "children"> as `${string & K}`]?: T[K];
    };
    interface IntrinsicElements extends ElementProps<HTMLElementTagNameMap> {}
  }
}
```
