import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "bun:test";

const here = dirname(fileURLToPath(import.meta.url));
const exampleRoot = resolve(here, "..");
const distDir = resolve(exampleRoot, "dist");

describe("astro-stories example: basic", () => {
  test("astro build produces the story route and indexes story modules", () => {
    rmSync(distDir, { force: true, recursive: true });

    const result = spawnSync("bunx", ["astro", "build"], {
      cwd: exampleRoot,
      encoding: "utf8",
      env: { ...process.env, CI: "1" },
    });

    if (result.status !== 0) {
      throw new Error(
        `astro build failed (status ${result.status}):\n${result.stdout}\n${result.stderr}`,
      );
    }

    const storyHtml = resolve(distDir, "story/index.html");
    expect(existsSync(storyHtml)).toBe(true);

    const html = readFileSync(storyHtml, "utf8");
    expect(html).toContain("<!DOCTYPE html>");

    const assetsDir = resolve(distDir, "_astro");
    expect(existsSync(assetsDir)).toBe(true);

    const bundled = readFileSync(storyHtml, "utf8");
    expect(bundled.length).toBeGreaterThan(0);
  }, 120_000);
});
