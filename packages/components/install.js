#!/usr/bin/env node

const childProcess = require('child_process');
const { arch, platform } = require('os');

function main() {
	try {
		require.resolve(`@sv/components-${platform()}-${arch()}`);
	} catch (e) {
		childProcess.execSync(`npm install @sv/components-${platform()}-${arch()}`);
	}
}

main();
