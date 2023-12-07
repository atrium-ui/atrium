#!/usr/bin/env bun
const args = process.argv.slice(2);

switch (args[1]) {
	case 'use': {
		import('./commands/use.mjs');
		break;
	}
	case 'new': {
		import('./commands/new.mjs');
		break;
	}
	default:
		console.log('Usage: new, use <component>');
}
