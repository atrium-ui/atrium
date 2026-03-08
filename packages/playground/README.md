# `@sv/playground`

Reusable React playground component for editing `index.html` and `index.tsx` side by side and rendering the result into a configurable preview page.

## Usage

```tsx
import {
  PlaygroundEditorsPanel,
  PlaygroundPreviewPanel,
  PlaygroundProvider,
} from "@sv/playground";

export function App() {
  return (
    <PlaygroundProvider previewUrl="/preview.html">
      <PlaygroundEditorsPanel />
      <PlaygroundPreviewPanel />
    </PlaygroundProvider>
  );
}
```

The preview page must expose a `#root` element and any runtime dependencies your generated code needs. A minimal Vite example is included in this package via [`index.html`](./index.html) and [`preview.html`](./preview.html).
