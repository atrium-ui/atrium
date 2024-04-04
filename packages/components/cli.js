#!/usr/bin/env node

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import enquirer from "enquirer";

const componentRoot = resolve(fileURLToPath(import.meta.url), "../src/");

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
export function component(name, framework) {
  if (framework) {
    return resolve(componentRoot, `${name}.${framework}.tsx`);
  }
  return resolve(componentRoot, `${name}.tsx`);
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

/**
 * @param {string[]} args
 */
export async function use(args = []) {
  const availableComponents = readdirSync(componentRoot).map((file) =>
    file.replace(".tsx", ""),
  );

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

  if (!flags.stdout) {
    const dist = resolve("./components");

    if (!existsSync(dist)) {
      mkdirSync(dist, {
        recursive: true,
      });
    }

    for (const comp of components) {
      const template = readFileSync(component(comp, flags.framework), "utf8");
      const filename = `${dist}/${comp}${
        flags.framework ? `.${flags.framework}` : ""
      }.tsx`;
      writeFileSync(filename, template);
      process.stdout.write(`√ ${comp}\n`);
    }
  }

  if (flags.stdout) {
    for (const comp of components) {
      const template = readFileSync(component(comp, flags.framework), "utf8");
      process.stdout.write(template);
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
