---
group: "docs"
icon: "carbon:template"
title: "Usage"
---

### Usage

Use a component in your project.

```bash
npx @sv/mono atrium use <component>
```

Or use elements directly.

```typescript
import "@sv/elements/a-expandable";
```

```tsx
<a-expandable opened></a-expandable>
```

<br/>
<br/>
<br/>

### Draft - TypeScript

![proptype.jpg](./images/proptype.jpg)

```json
// /tsconfig.json
{
  "compilerOptions": {
    "types": ["@sv/mono"]
  }
}
```
