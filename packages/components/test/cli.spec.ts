import { test, expect, afterEach } from "bun:test";
import { $ } from "bun";
import fs from "node:fs";
import { resolve } from "node:path";
import * as cli from "../cli.js";

afterEach(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(0), 250));

  // cleanup components directory
  const tmp = resolve("./components");
  console.info("cleanup", tmp);
  fs.rmSync(tmp, { force: true, recursive: true });
});

test("resolve cli bin", async () => {
  const binPath = require.resolve("@sv/components");

  const out = await $`${binPath} Button.vue`;
  expect(out.exitCode).toBe(0);

  const dir = fs.readdirSync("./components/");
  expect(dir).toContain("Button.vue.tsx");
});

test("use button template", async () => {
  await cli.use(["Button.vue"]);

  const dir = fs.readdirSync("./components/");
  expect(dir).toContain("Button.vue.tsx");
});
