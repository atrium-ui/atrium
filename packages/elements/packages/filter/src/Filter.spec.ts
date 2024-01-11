import { describe, expect, it } from 'bun:test';

const NODE_NAME = 'a-filter';

describe(NODE_NAME, () => {
	it('import element', async () => {
		const { Filter } = await import('../dist/index.js');
		expect(Filter).toBeDefined();

		// is defined in custom element registry
		expect(customElements.get(NODE_NAME)).toBeDefined();

		// is constructable
		expect(new Filter()).toBeInstanceOf(Filter);

		const html = `<${NODE_NAME} />`;
		const ele = document.createElement('div');
		ele.innerHTML = html;

		expect(ele.children[0]).toBeInstanceOf(Filter);
	});
});
