#!/usr/bin/env node

import childProcess from 'child_process';
import path from 'path';
import { arch, platform } from 'os';
import url from 'url';

function getExecutable() {
	const plat = platform();

	let arc = arch();
	if (arc === 'arm64') arc = 'aarch64';

	return path.resolve(
		path.dirname(url.fileURLToPath(import.meta.url)),
		`./dist/${arc}-${plat}/components`
	);
}

export function main(args) {
	const result = childProcess.spawnSync(getExecutable(), args, {
		stdio: 'inherit',
	});

	if (result.status !== 0) throw new Error(result.error);
	return result;
}

if (process.stdout.isTTY) main(process.argv.slice(2));
