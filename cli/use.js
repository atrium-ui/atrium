#!/usr/bin/env node
const { resolve } = require('path');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');

const args = process.argv.slice(2);

const dist = resolve('./src/components');

if (args[0] === 'use') {
  if (!args[1]) {
    console.log('Please provide a name for the template.');
    process.exit(1);
  }

  if (!existsSync(dist)) {
    mkdirSync(dist, {
      recursive: true,
    });
  }

  const template = readFileSync(resolve(__dirname, `../components/${args[1]}.tsx`), 'utf8');
  const filename = `${dist}/${args[1]}.tsx`;
  writeFileSync(filename, template);

  console.log('use', args[1], filename);
}
