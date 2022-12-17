# collapsable

A more basic element of an accordion that only includes the animation and scroll behavios for collapsable content.

## Properties

```typescript
// Opened or closed (read and write)
<aui-collapsable opened: Boolean; />
```

## Example

```tsx
const collapsable = (
	<aui-collapsable opened>
		<div class="content">${lorem.generateParagraphs(6)}</div>
	</aui-collapsable>
);
```

## Publish new version

Create a new version:

```bash
npm version [major | minor | patch]
```

Push tag:

```bash
git push origin [version tag]
```

The CI pipeline will create a new package version at that tag.
