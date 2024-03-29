import { test, expect } from "bun:test";
import { $ } from "bun";

test("valid configuration", async () => {
  const out = await $`biome check .`;
  expect(out.exitCode).toBe(0);
});
