#!/usr/bin/env node

import chalk from "chalk";
import enquirer from "enquirer";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dependencyTree from "dependency-tree";

const componentRoot = resolve(fileURLToPath(import.meta.url), "../../src/");

const HELP = `
  Usage: cli [options] [components]

  Options:
  --vue          Use Vue framework
  --stdout        Print to stdout instead of writing to file
  --help         Print this help

`;

/**
 * @param {string} name
 * @param {string} [framework]
 */
export async function component(name, framework = "vue") {
  const file = resolve(componentRoot, framework, `${name}.tsx`);
  const files = await peers(file);
  return files;
}

export function detectFramework() {
  const root = resolve("./");
  const packageJson = resolve(root, "package.json");

  if (existsSync(packageJson)) {
    const json = JSON.parse(readFileSync(packageJson, "utf8"));
    if (json.dependencies.react) return "react";
    if (json.dependencies["solid-js"]) return "solid";
    if (json.dependencies.vue) return "vue";
    if (json.dependencies.nuxt) return "vue";
  }

  return undefined;
}

export async function peers(file) {
  const list = dependencyTree.toList({
    filename: file,
    directory: componentRoot,
    filter(mod) {
      return !mod.match("node_modules");
    },
  });
  return list;
}

/**
 * @param {string[]} args
 */
export async function use(args = []) {
  const flags = {
    framework:
      (args.find((arg) => arg.startsWith("--vue")) && "vue") ||
      (args.find((arg) => arg.startsWith("--react")) && "react") ||
      (args.find((arg) => arg.startsWith("--solid")) && "solid") ||
      detectFramework(),
    stdout: args.find((arg) => arg.startsWith("--stdout")),
    help: args.find((arg) => arg.startsWith("--help")),
  };

  if (flags.help) {
    process.stderr.write(HELP);
    return;
  }

  const availableComponents = [
    ...readdirSync(resolve(componentRoot, "vue")).map((file) => file.replace(".tsx", "")),
  ];

  const components = args.filter((arg) => {
    if (availableComponents.includes(arg)) {
      return true;
    }
    return false;
  });

  if (process.stdin.isTTY && components.length === 0) {
    const options = readdirSync(componentRoot)
      .filter((file) => file.match(".tsx"))
      .map((file) => file.replace(".tsx", ""));

    // @ts-ignore
    const { component } = await enquirer.prompt({
      type: "multiselect",
      name: "component",
      message: "Select components to copy",
      // @ts-ignore
      footer: chalk.dim("Press <space> to select"),
      stdout: process.stderr,
      choices: options,
    });

    if (component) components.push(...component);
  }

  if (components.length === 0) {
    return;
  }

  if (flags.stdout) {
    for (const comp of components) {
      const files = await component(comp, flags.framework);
      for (const file of files) {
        process.stdout.write(readFileSync(file, "utf8"));
      }
    }
    return;
  }

  const dist = resolve("./components");

  if (!existsSync(dist)) {
    mkdirSync(dist, {
      recursive: true,
    });
  }

  for (const comp of components) {
    const files = await component(comp, flags.framework);
    for (const file of files) {
      const name = file.split("/").pop()?.split(".")[0];
      writeFileSync(`${dist}/${name}.tsx`, readFileSync(file, "utf8"));
      process.stdout.write(`√ ${name}\n`);
    }
  }
}

if (import.meta.main === undefined || import.meta.main === true) {
  use(process.argv.slice(2))
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
