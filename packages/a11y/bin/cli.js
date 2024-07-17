#!/usr/bin/env bun

import pa11y from "pa11y";
import { exec, execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const configPath = path.resolve(process.argv[2]);
const serverCommand = process.argv[3];

execSync("npx puppeteer browsers install chrome", {
  stdio: "inherit",
});

function waitForHttp(url) {
  console.info("Waiting for", url);

  let int;

  function tryFetch(callback) {
    setTimeout(() => {
      fetch(url, { cache: "no-store" })
        .then((res) => {
          console.info("Got response", res.status);
          if (res.status === 200) {
            callback();
            clearTimeout(int);
          }
        })
        .catch((err) => {
          console.error("Fetch failed retry in 250ms");

          clearTimeout(int);
          int = setTimeout(() => tryFetch(callback), 250);
        });
    }, 2000);
  }

  return new Promise(tryFetch);
}

async function main() {
  if (!configPath || !serverCommand) {
    console.error("Missing args");
    return 1;
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  console.info("Starting server");
  const server = exec(serverCommand);

  server.on("exit", (code) => {
    if (code !== 0) {
      console.info("Server exited with code", code);
      process.exit(1);
    }
  });

  await waitForHttp(config.urls[0]);

  const reports = [];

  return new Promise((resolve, reject) => {
    for (const url of config.urls) {
      pa11y(url, {}).then((results) => {
        console.log(results);
        results.push(results);
      });
    }

    // const report = JSON.parse(stdout);

    // console.info(JSON.stringify(report, null, "  "));

    // resolve(report.errors > 0 || report.passes < 1 ? 1 : 0);
  }).finally(() => {
    console.info("Killing server");
    server.kill();
  });
}

main()
  .then((code) => {
    console.info("Suucessful run with code", code);
    process.exit(code);
  })
  .catch((err) => {
    console.error("Failed", err);
    process.exit(1);
  });
