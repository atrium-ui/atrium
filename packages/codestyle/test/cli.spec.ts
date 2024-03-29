import { test, expect } from "bun:test";
import { $ } from "bun";

test("prepare script", async () => {
  const out = await $`npm run postinstall`;
  expect(out.exitCode).toBe(0);
});
