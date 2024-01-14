import { describe, expect, it } from 'bun:test';

describe('cli', () => {
	it('use button template', async () => {
		const out = await import('../cli.js').then((m) => m.default);
		expect(out.status).toBe(0);
	});
});
