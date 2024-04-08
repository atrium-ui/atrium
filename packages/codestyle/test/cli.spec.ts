import { $ } from "bun";
import { afterEach, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const testPackagePath = "test/pkg";
const testPackageJsonPath = path.resolve(`${testPackagePath}/package.json`);

afterEach(async () => {
  await $`git reset --hard ${testPackagePath}`;
});

test("prepare script", async () => {
  const out = await $`npm run postinstall`;
  expect(out.exitCode).toBe(0);
});

test("test prettier", async () => {
  const out = await $`cd ${testPackagePath} && bun x @sv/codestyle prettier`;
  expect(out.exitCode).toBe(0);
  const pkg = fs.readFileSync(testPackageJsonPath);
  const json = JSON.parse(pkg.toString());
  // @ts-ignore
  expect(json.prettier).toBeString();
});

test("test biome", async () => {
  const out = await $`cd ${testPackagePath} && bun x @sv/codestyle biome`;
  expect(out.exitCode).toBe(0);
  expect(fs.existsSync(`${testPackagePath}/biome.json`)).toBeTrue();

  const pkg = fs.readFileSync(testPackageJsonPath);
  const json = JSON.parse(pkg.toString());
  // @ts-ignore
  expect(json.devDependencies["@biomejs/biome"]).toBeString();
});
