# a-dropdown

Universal dropdown component

## Properties

```typescript
// If the dropdown should open upwards or downwards
<a-dropdown direction: 'down' | 'up'; />
```

```typescript
// The value or index of the selected option
// If the option does not have a 'value' attribute, indexes will be used.
<a-dropdown selected: String; />
```

```typescript
// Open state of the dropdown
<a-dropdown opened: Boolean; />
```

```typescript
// Prevents the dropdown from opening
<a-dropdown disabled: Boolean; />
```

## Events

```typescript
// Emitted after the dropdown closed
<a-dropdown @close />
```

```typescript
// Emitted *before* the dropdown opens
<a-dropdown @open />
```

```typescript
// Emitted after a option has been slected by Click or Enter key
<a-dropdown @select: ({ option: OptionElement; }) => void />
```

## Example

```tsx
const dropdown = (
	<a-dropdown
		@select={(e) => {
			this.value = e.option.value;
		}}
	>
		<button slot="input">{{ this.value || 'Select' }}</button>

		<a-option>Option 1</a-option>
		<a-option>Option 2</a-option>
		<a-option>Option 3</a-option>
		<a-option>Option 4</a-option>
	</a-dropdown>
);
```
