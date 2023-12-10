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
<br/>
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
