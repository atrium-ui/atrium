---
group: "docs"
icon: "carbon:template"
title: "Usage"
---

### Usage

Use a component in your project.

```bash
npx @sv/components use <a-component>
```

Or use elements directly.

```typescript
import "@sv/elements/a-expandable";
```

```tsx
<a-expandable opened></a-expandable>
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
