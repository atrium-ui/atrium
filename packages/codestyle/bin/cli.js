#!/usr/bin/env node
/// <reference types="node" />

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.exit(
  (() => {
    const args = process.argv.slice(2);

    switch (args[0]) {
      case "tsconfig":
        writeFile(
          path.join(getRootPackagePaath(), "tsconfig.json"),
          JSON.stringify(
            {
              $schema: "http://json.schemastore.org/tsconfig",
              extends: ["@sv/codestyle/tsconfig.json"],
            },
            null,
            "  ",
          ),
        );
        break;

      case "biome":
        writeFile(
          path.join(getRootPackagePaath(), "biome.json"),
          JSON.stringify(
            {
              $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
              extends: ["@sv/codestyle/biome"],
            },
            null,
            "  ",
          ),
        );
        console.info(
          "[codestyle] See https://biomejs.dev/guides/integrate-in-editor/ for editor integration.",
        );
        console.info("[codestyle] Installing biome...");
        installPackage("@biomejs/biome");
        break;

      case "editorconfig": {
        const __filename = fileURLToPath(import.meta.url);
        copyFile(
          path.resolve(__filename, "../../.editorconfig"),
          path.join(getRootPackagePaath(), ".editorconfig"),
        );
        break;
      }

      default:
        console.error("Unknown argument:", args[0]);
        console.info("Available arguments: tsconfig, biome, editorconfig");
        return 1;
    }

    return 0;
  })(),
);

/**
 * Find a file by name in the parent directories
 * @param {string} name
 */
function findUp(name) {
  let cwd = path.join(process.cwd(), "..");
  let depth = 0;
  while (depth < 5) {
    if (cwd === "/") {
      return null;
    }
    const filePath = path.join(cwd, name);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    cwd = path.join(cwd, "..");
    depth++;
  }
  return null;
}

function getRootPackagePaath() {
  // pnpm
  if (process.env.npm_config_dir) {
    return process.env.npm_config_dir;
  }

  // npm, yarn and bun
  if (process.env.npm_package_json) {
    return path.dirname(process.env.npm_package_json);
  }

  const packageJsonPath = findUp("package.json");
  if (packageJsonPath) {
    return path.dirname(packageJsonPath);
  }

  console.error("[codestyle] Could not resolve root package. Ignored.");
  process.exit(0);
}

/**
 * Detect the package manager used in the project
 */
function detectPackageManager() {
  if (fs.existsSync("pnpm-lock.yaml")) {
    return "pnpm";
  }

  if (fs.existsSync("yarn.lock")) {
    return "yarn";
  }

  if (fs.existsSync("package-lock.json")) {
    return "npm";
  }

  if (fs.existsSync("bun.lockb")) {
    return "bun";
  }

  console.error("[codestyle] Could not detect package manager. Ignored.");
  process.exit(1);
}

/**
 * Install a package using the detected package manager
 * @param {string} packageName
 */
function installPackage(packageName) {
  const command = {
    npm: ["install", "--save-dev", packageName],
    yarn: ["add", "--dev", packageName],
    pnpm: ["add", "--save-dev", packageName],
    bun: ["add", "--dev", packageName],
  };

  const packageManager = detectPackageManager();
  const proc = spawnSync(packageManager, command[packageManager]);
  if (proc.status !== 0) {
    console.error(`[codestyle] Failed to install ${packageName}`);
    console.error("[codestyle]", proc.error);
    process.exit(1);
  }
  return 0;
}

/**
 * Write the editorconfig file to the given path
 * @param {string} sourcePath
 * @param {string} outputPath
 */
function copyFile(sourcePath, outputPath) {
  const content = fs.readFileSync(sourcePath).toString();
  return writeFile(outputPath, content);
}

/**
 * Write the editorconfig file to the given path
 * @param {string} outputPath
 * @param {string} content
 */
function writeFile(outputPath, content) {
  // TODO: Diff the files and prompt the user to overwrite
  if (!fs.existsSync(outputPath)) {
    fs.writeFileSync(outputPath, content);

    console.info(`[codestyle] Wrote to ${outputPath}`);
  }

  console.info(`[codestyle] File already exists at ${outputPath}`);
  process.exit(0);
}
