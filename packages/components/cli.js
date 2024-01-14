#!/usr/bin/env node

import childProcess from 'child_process';
import { arch, platform } from 'os';

const plat = platform();

let arc = arch();
if (arc === 'x64') arc = 'amd64';

export default childProcess.spawnSync(`./dist/use_${plat}_${arc}`, ['button'], {
	stdio: 'inherit',
});
