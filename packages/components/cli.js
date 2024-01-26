#!/usr/bin/env node

import childProcess from 'child_process';
import { arch, platform } from 'os';

function getExecutable() {
	const plat = platform();

	let arc = arch();
	if (arc === 'arm64') arc = 'aarch64';

	return `@sv/components-${plat}-${arc}`;
}

export function main(args) {
	const binPath = require.resolve(getExecutable());
	const result = childProcess.spawnSync(binPath, args, {
		stdio: 'inherit',
		env: {
			...process.env,
		},
	});

	if (result.status !== 0) throw new Error(result.error);
	return result;
}

if (process.stdout.isTTY) main(process.argv.slice(2));
