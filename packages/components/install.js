#!/usr/bin/env node
const fs = require('fs');
fs.mkdirSync('./bin');
fs.renameSync(`./dist/use_${process.platform}_${process.arch}`, './bin/use');
fs.rmdirSync('./dist', { recursive: true, force: true });
