#!/usr/bin/env node
/// <reference types="node" />

import fs from 'node:fs';
import path from 'node:path';

let root_package = process.env.npm_package_json;

const DEBUG = process.env.NODE_DEBUG === 'true';

if (!root_package) {
	// Fallback to parent package
	if (DEBUG)
		console.debug('$npm_package_json is not set, falling back to parent package');

	root_package = path.resolve('../../package.json');

	if (DEBUG) console.debug('Parent package:', root_package);

	if (!fs.existsSync(root_package)) {
		console.error('This script must be run with npm');
		process.exit(1);
	}
}

const root_path = path.dirname(root_package);
const editorconfig_path = path.join(root_path, '.editorconfig');

const configs = {
	editorconfig: path.resolve('./.editorconfig'),
};

// TODO: Diff the files and prompt the user to overwrite
if (!fs.existsSync(editorconfig_path)) {
	fs.writeFileSync(editorconfig_path, fs.readFileSync(configs.editorconfig));

	if (DEBUG) console.debug('Wrote editorconfig to', editorconfig_path);
}

process.exit(0);
