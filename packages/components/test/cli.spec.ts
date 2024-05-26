import { test, expect, afterEach } from "bun:test";
import { $ } from "bun";
import fs from "node:fs";
import { resolve } from "node:path";
import * as cli from "../bin/cli.js";

afterEach(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(0), 250));

  // cleanup components directory
  const tmp = resolve("./components");
  console.info("cleanup", tmp);
  fs.rmSync(tmp, { force: true, recursive: true });
});

test("resolve bin", async () => {
  const binPath = require.resolve("@sv/components");
  expect(binPath).toBeDefined();
});

test("use cli", async () => {
  const binPath = require.resolve("@sv/components");
  const out = await $`${binPath} Button`;
  expect(out.exitCode).toBe(0);
  const dir = fs.readdirSync("./components/");
  expect(dir).toContain("Button.tsx");
});

test("use button template", async () => {
  await cli.use(["Button"]);

  const dir = fs.readdirSync("./components/");
  console.info(dir);
  expect(dir).toContain("Button.tsx");
});

test("use form template", async () => {
  await cli.use(["Form"]);

  const dir = fs.readdirSync("./components/");
  expect(dir).toContain("Button.tsx");
  expect(dir).toContain("Input.tsx");
  expect(dir).toContain("Form.tsx");
});
