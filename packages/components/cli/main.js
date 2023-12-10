#!/usr/bin/env bun
const args = process.argv.slice(2);

switch (args[1]) {
	case 'use': {
		import('./use/use.mjs');
		break;
	}
	default:
		console.log('Usage: use <component>');
}
