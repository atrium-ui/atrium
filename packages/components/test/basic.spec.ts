import { describe, expect, it } from 'bun:test';
import fs from 'fs';

describe('cli', () => {
	it('use button template', async () => {
		const out = await import('../cli.js').then((m) => m.main(['button']));
		expect(out.status).toBe(0);

		const dir = fs.readdirSync('./src/components/ui/');
		expect(dir).toContain('button.tsx');

		// cleanup
		fs.rmSync('./src/components', { force: true, recursive: true });
	});
});
