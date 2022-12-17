# aui-dropdown

Universal dropdown component

## Properties

```typescript
// If the dropdown should open upwards or downwards
<aui-dropdown direction: 'down' | 'up'; />
```

```typescript
// The value or index of the selected option
// If the option does not have a 'value' attribute, indexes will be used.
<aui-dropdown selected: String; />
```

```typescript
// Open state of the dropdown
<aui-dropdown opened: Boolean; />
```

```typescript
// Prevents the dropdown from opening
<aui-dropdown disabled: Boolean; />
```

## Events

```typescript
// Emitted after the dropdown closed
<aui-dropdown @close />
```

```typescript
// Emitted *before* the dropdown opens
<aui-dropdown @open />
```

```typescript
// Emitted after a option has been slected by Click or Enter key
<aui-dropdown @select: ({ option: OptionElement; }) => void />
```

## Example

```tsx
const dropdown = (
	<aui-dropdown
		@select={(e) => {
			this.value = e.option.value;
		}}
	>
		<button slot="input">{{ this.value || 'Select' }}</button>

		<aui-option>Option 1</aui-option>
		<aui-option>Option 2</aui-option>
		<aui-option>Option 3</aui-option>
		<aui-option>Option 4</aui-option>
	</aui-dropdown>
);
```
