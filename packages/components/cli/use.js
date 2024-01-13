#!/usr/bin/env node
require('child_process').execSync(`./dist/use_${process.platform}_${process.arch}`, {
	stdio: 'inherit',
});
