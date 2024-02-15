import { describe, expect, it } from "bun:test";
import { $ } from "bun";
import fs from "fs";

describe("cli", () => {
	it("use button template", async () => {
		const binPath = require.resolve("@sv/components");

		const out = await $`${binPath} button`;
		expect(out.exitCode).toBe(0);

		const dir = fs.readdirSync("./src/components/ui/");
		expect(dir).toContain("button.tsx");

		// cleanup
		fs.rmSync("./src/components", { force: true, recursive: true });
	});
});
