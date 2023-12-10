import { describe, expect, it } from 'bun:test';
import fs from 'fs';

describe('test use cli', () => {
	it('call cli', async () => {
		const { component } = await import('./use.mjs');
		expect(typeof component).toBe('function');

		const componentPath = component('checkbox');
		expect(fs.existsSync(componentPath)).toBe(true);
	});
});
