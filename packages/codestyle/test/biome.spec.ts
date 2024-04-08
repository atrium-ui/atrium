import { $ } from "bun";
import { expect, test } from "bun:test";

test("valid biome configuration", async () => {
  // check runs in root of this repo, since it extends this package.
  const out = await $`bun x biome check .`;
  expect(out.exitCode).toBe(0);
});
