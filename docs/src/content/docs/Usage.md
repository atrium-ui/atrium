---
group: "docs"
icon: "carbon:template"
title: "Usage"
---

### 1. Install the packages.

```bash
npm i @sv/elements @sv/components
```

### 2. Use a component in your project.

```bash
npx @sv/components use button
```

This **copies** a component template into your project.

### 3. Change styling or behavior of the component in the copy inside your project.

### 4. Import and use the components anywhere in your project.

```tsx
import "~/components/Button";

<Button variant="outline">Click me</Button>;
```

### 5. Use elements directly anywhere in your project.

```tsx
import "@sv/elements/a-expandable";

<a-expandable opened></a-expandable>;
```

<br/>

#### Support

[Can I use](https://caniuse.com/mdn-api_window_customelements) Support for WebComponents exists in major browsers since around 2018.

![Support table](../../assets/support.jpg)

[More information here](https://www.webcomponents.org/)

<br/>

### Draft - TypeScript

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@sv/elements"]
  }
}
```
