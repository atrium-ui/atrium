#!/usr/bin/env node
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import en from 'enquirer';

const args = process.argv.slice(2);

const dist = resolve('./src/components');

const componentRoot = resolve(fileURLToPath(import.meta.url), '../../../components/templates/');

function component(name) {
	return resolve(componentRoot, `${name}.tsx`);
}

export default async function main() {
	const components = [];

	if (args[2]) {
		components.push(args[2]);
	}

	if (components.length === 0) {
		const options = readdirSync(componentRoot)
			.filter((file) => file.match('.tsx'))
			.map((file) => file.replace('.tsx', ''));

		// @ts-ignore
		const prompt = new en.MultiSelect({
			name: 'component',
			message: 'Pick components you want to use',
			choices: options,
		});

		const component = await prompt.run();
		components.push(...component);
	}

	if (components.length === 0) {
		process.exit(1);
	}

	if (!existsSync(dist)) {
		mkdirSync(dist, {
			recursive: true,
		});
	}

	for (const comp of components) {
		const template = readFileSync(component(comp), 'utf8');
		const filename = `${dist}/${comp}.tsx`;
		writeFileSync(filename, template);
		console.log('use', comp, filename);
	}
}

main();
