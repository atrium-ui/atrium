# sv-accordion

Basic Accordion component.

## Properties

```typescript
// Open state of the dropdown
<sv-accordion opened: Boolean; />
```

## Example

```tsx
const accordion = (
	<sv-accordion exclusive>
		<sv-accordion-item>
			<div slot="title" class="titlebar">
				Item 1
			</div>
			<div class="content">${lorem.generateParagraphs(3)}</div>
		</sv-accordion-item>
		<sv-accordion-item>
			<div slot="title" class="titlebar">
				Item 2
			</div>
			<div class="content">${lorem.generateParagraphs(3)}</div>
		</sv-accordion-item>
		<sv-accordion-item>
			<div slot="title" class="titlebar">
				Item 3
			</div>
			<div class="content">${lorem.generateParagraphs(3)} Yo</div>
		</sv-accordion-item>
	</sv-accordion>
);
```

## Install

```bash
npm i @atrium-ui/accordion
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
