import { test, expect } from "bun:test";
import { $ } from "bun";

test("prepare script", async () => {
  const out = await $`npm run prepare`;
  expect(out.exitCode).toBe(0);
});
