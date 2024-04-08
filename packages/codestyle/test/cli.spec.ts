import { $ } from "bun";
import { expect, test } from "bun:test";
import fs from "node:fs";

test("prepare script", async () => {
  const out = await $`npm run postinstall`;
  expect(out.exitCode).toBe(0);
});

test("test prettier", async () => {
  const out = await $`cd test/pkg && bun x @sv/codestyle prettier`;
  expect(out.exitCode).toBe(0);
  const pkg = fs.readFileSync("test/pkg/package.json");
  const json = JSON.parse(pkg.toString());
  // @ts-ignore
  expect(json.prettier).toBeString();
});

test("test biome", async () => {
  const out = await $`cd test/pkg && bun x @sv/codestyle biome`;
  expect(out.exitCode).toBe(0);
  expect(fs.existsSync("test/biome.json")).toBeTrue();

  const pkg = fs.readFileSync("test/pkg/package.json");
  const json = JSON.parse(pkg.toString());
  // @ts-ignore
  expect(json.devDependencies["@biomejs/biome"]).toBeString();
});
