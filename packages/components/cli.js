#!/usr/bin/env node

const childProcess = require('child_process');
const { arch, platform } = require('os');

function main(args) {
	const binPath = require.resolve(`@sv/components-${platform()}-${arch()}`);
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

module.exports = { main };
