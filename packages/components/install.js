#!/usr/bin/env node
const fs = require('fs');
try {
	fs.renameSync(`./dist/use_${process.platform}_${process.arch}`, './bin/use', { recursive: true });
	fs.rmdirSync('./dist', { recursive: true, force: true });
} catch (err) {
	console.error('postinstall script failed.');
}
