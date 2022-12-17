<script lang="ts" setup>
import '@sv-components/accordion/src';

import { hstEvent } from 'histoire/client';
import { reactive } from 'vue';
import { paragraph, sentence } from 'txtgen';

const state = reactive({
	exclusive: true
});
</script>

<template>
	<Story>
		<sv-accordion @item-opened-change="hstEvent('Item Toggle', $event)" :exclusive="state.exclusive">
			<sv-accordion-item v-for="(item, i) of 3" :key="i">
				<div slot="title" class="titlebar">
					<div class="headline">Lorem Ipsum</div>
					<div class="collapse-icon">
						<svg class="plus-icon" width="18px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
							<path d="M8.6,20v-8.5H0V8.6h8.6V0h2.9v8.6H20v2.9h-8.6V20H8.6z" />
						</svg>
						<svg class="minus-icon" width="18px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
							<path d="M0,11.5V8.6h20v2.9H0z" />
						</svg>
					</div>
				</div>
				<div class="content">{{ paragraph(4) }}</div>
			</sv-accordion-item>
		</sv-accordion>

		<template #controls>
			<HstCheckbox title="Exclusive" v-model.number="state.exclusive" />
		</template>
	</Story>
</template>

<style scoped>
sv-accordion {
	font-family: sans-serif;
}

sv-accordion-item {
	margin-top: 2px;
	background: #f0f0f0;
	border-radius: 8px;
	overflow: hidden;
	font-size: 18px;
}

sv-accordion-item:not([opened]) .plus-icon {
	transform: rotate(90deg);
}
sv-accordion-item:not([opened]) .minus-icon {
	transform: rotate(90deg);
}
sv-accordion-item[opened] .plus-icon {
	opacity: 0;
}

.titlebar {
	padding: 1.5rem 2rem;
	display: flex;
	justify-content: space-between;
}

.collapse-icon {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
}

.minus-icon,
.plus-icon {
	position: absolute;
	transition: opacity 0.2s ease, transform 0.2s ease 0.02s;
}

.content {
	font-size: 16px;
	white-space: pre-line;
	text-transform: none;
	padding: 20px;
}
</style>

<docs lang="md">
# sv-accordion

Basic Accordion component.

## Properties

```typescript
// Open state of the dropdown
<sv-accordion opened: Boolean; />
```

## Install

```bash
npm i @sv-components/accordion
```
</docs>
