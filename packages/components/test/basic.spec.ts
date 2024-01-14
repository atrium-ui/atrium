import { describe, expect, it } from 'bun:test';
import fs from 'fs';

describe('cli', () => {
	it('use button template', async () => {
		const out = await import('../cli.js').then((m) => m.default);
		expect(out.status).toBe(0);

		const dir = fs.readdirSync('./src/components/ui/');
		expect(dir).toContain('button.tsx');

		// cleanup
		fs.rmSync('./src', { force: true, recursive: true });
	});
});
