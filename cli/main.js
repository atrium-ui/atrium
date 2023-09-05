#!/usr/bin/env node
const args = process.argv.slice(2);

switch(args[0]) {
  case 'use': {
    require("./commands/use.js")();
    break;
  }
  case 'new': {
    require("./commands/new.mjs")();
    break;
  }
  default:
    console.log("Usage: new, use <component>");
}
