#!/usr/bin/env node
/// <reference types="node" />

import fs from "node:fs";
import path from "node:path";

const DEBUG = process.env.NODE_DEBUG === "true";

function getRootPackagePaath() {
  // pnpm
  if (process.env.npm_config_dir) {
    return process.env.npm_config_dir;
  }

  // npm, yarn and bun
  if (process.env.npm_package_json) {
    return path.dirname(process.env.npm_package_json);
  }

  // Fallback to parent package
  if (DEBUG)
    console.debug(
      "root_package could not be resolved from env, falling back to parent package",
    );

  const root_package = path.resolve("../../");

  if (DEBUG) console.debug("root_package:", root_package);

  if (fs.existsSync(root_package)) {
    return root_package;
  }

  return null;
}

const root_path = getRootPackagePaath();

if (!root_path) {
  console.error("Could not resolve root package. Ignore.");
  process.exit(0);
}

const editorconfig_path = path.join(root_path, ".editorconfig");

const configs = {
  editorconfig: path.resolve("./.editorconfig"),
};

// TODO: Diff the files and prompt the user to overwrite
if (!fs.existsSync(editorconfig_path)) {
  fs.writeFileSync(editorconfig_path, fs.readFileSync(configs.editorconfig));

  if (DEBUG) console.debug("Wrote editorconfig to", editorconfig_path);
}

process.exit(0);
