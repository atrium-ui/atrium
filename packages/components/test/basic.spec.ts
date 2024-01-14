import childProcess from 'child_process';
import { describe, expect, it } from 'bun:test';

describe('cli', () => {
	it('use button template', async () => {
		const out = childProcess.spawnSync(
			`./dist/use_${process.platform}_${process.arch}`,
			['button'],
			{
				cwd: __dirname,
				stdio: 'inherit',
			}
		);

		expect(out.status).toBe(0);
	});
});
