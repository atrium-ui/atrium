import { describe, expect, it } from "bun:test";
import { $ } from "bun";

describe("biome", () => {
	it("valid configuration", async () => {
		const out = await $`biome check .`;
		expect(out.exitCode).toBe(0);
	});
});
