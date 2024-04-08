import { $ } from "bun";
import { expect, test } from "bun:test";

test("prepare script", async () => {
  const out = await $`npm run postinstall`;
  expect(out.exitCode).toBe(0);
});

test("test", async () => {
  const out = await $`cd test && bun x @sv/codestyle prettier`;
  expect(out.exitCode).toBe(1);
});
