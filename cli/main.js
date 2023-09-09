#!/usr/bin/env bun
const args = process.argv.slice(2);

switch (args[0]) {
  case 'use': {
    import('./commands/use.js').then((mod) => {
      mod.default();
    });
    break;
  }
  case 'new': {
    import('./commands/new.mjs').then((mod) => {
      mod.default();
    });
    break;
  }
  default:
    console.log('Usage: new, use <component>');
}
