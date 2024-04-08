import { $ } from "bun";
import { afterAll, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const testPackagePath = "test/pkg";
const testPackageJsonPath = path.resolve(`${testPackagePath}/package.json`);
const cliBin = path.resolve("./bin/cli.js");

const env = {
  npm_package_json: testPackageJsonPath,
};

afterAll(async () => {
  await $`git restore -s@ -SW -- ${testPackagePath}`;
  await $`git clean -xdf ${testPackagePath}`;
});

test("prepare script", async () => {
  const out = await $`npm run postinstall`;
  expect(out.exitCode).toBe(0);
});

test("test prettier", async () => {
  expect((await $`bun ${cliBin} prettier`.cwd(testPackagePath).env(env)).exitCode).toBe(
    0,
  );

  const json = JSON.parse(fs.readFileSync(testPackageJsonPath).toString());
  // @ts-ignore
  expect(json.prettier).toBeString();
});

// TODO: annoying because it detects npm as package manager
// test("test biome", async () => {
//   expect((await $`bun ${cliBin} biome`.cwd(testPackagePath).env(env)).exitCode).toBe(0);

//   expect(fs.existsSync(`${testPackagePath}/biome.json`)).toBeTrue();

//   const json = JSON.parse(fs.readFileSync(testPackageJsonPath).toString());
//   // @ts-ignore
//   expect(json.devDependencies["@biomejs/biome"]).toBeString();
// });
