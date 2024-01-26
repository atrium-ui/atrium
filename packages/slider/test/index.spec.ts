import { describe, expect, it } from 'bun:test';

describe('plain slider import', () => {
	it('import plain module', async () => {
		const out = await import(require.resolve('@sv/slider'));

		expect(out.Slider).toBeDefined();
		expect(out.Dragger).toBeDefined();
	});
});
