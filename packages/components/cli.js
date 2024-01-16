#!/usr/bin/env node

import childProcess from 'child_process';
import path from 'path';
import { arch, platform } from 'os';
import url from 'url';

const plat = platform();

let arc = arch();
if (arc === 'x64') arc = 'amd64';

const executable = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), `./dist/use_${plat}_${arc}`);

export function main(args) {
	return childProcess.spawnSync(executable, args, {
		stdio: 'inherit',
	});
}

if(process.stdout.isTTY) {
	main(process.argv.slice(2));
}
