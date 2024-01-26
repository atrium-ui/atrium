import { describe, expect, it } from 'bun:test';

describe('html-to-custom-tag-replacement import', () => {
	it('import module', async () => {
		const out = await import(require.resolve('@sv/html-to-custom-tag-replacement'));
		expect(out.default.name).toBe('HtmlToCustomTagReplacement');
	});
});
