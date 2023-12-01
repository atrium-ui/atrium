import prompts from 'prompts';
import fs from 'node:fs';
import path from 'path';
import readline from 'readline';

const examples = fs.readdirSync('./examples');

// copyright by ChatGPT
function copy(src, dest, name) {
	const isDirectory = fs.lstatSync(src).isDirectory();

	if (isDirectory) {
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}

		const files = fs.readdirSync(src);

		// biome-ignore lint/complexity/noForEach: <explanation>
		files.forEach((file) => {
			const srcPath = path.join(src, file);
			const destPath = path.join(dest, file);
			copy(srcPath, destPath, capitalize(name));
		});
	} else {
		fs.copyFileSync(src, dest.replace('Example', capitalize(name)));
	}
}

function capitalize(str) {
	return str
		.split('-')
		.map((s) => s[0].toUpperCase() + s.slice(1))
		.join('');
}

function replaceContent(file, regex, value) {
	const f = fs.readFileSync(file);
	const c = f.toString();
	const content = c.replaceAll(regex, value);
	fs.writeFileSync(file, content);
}

export default async function () {
	console.log('Select a template:');

	const { template } = await prompts([
		{
			type: 'select',
			name: 'template',
			message: 'Pick a template',
			instructions: false,
			choices: examples,
		},
	]);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.question('Give it a name: \n➡� ', (id) => {
		const name = capitalize(id);

		const compPath = `components/${id}`;
		copy(`examples/${examples[template]}`, compPath, name);

		replaceContent(`${compPath}/package.json`, /example/g, id);
		replaceContent(
			`${compPath}/stories/${name}.story.vue`,
			'examples/lit-component',
			`components/${id}`
		);
		replaceContent(`${compPath}/stories/${name}.story.md`, 'Example', name);
		replaceContent(`${compPath}/src/index.ts`, 'examples/lit-component', `components/${id}`);
		replaceContent(`${compPath}/src/index.ts`, 'Example', name);
		replaceContent(`${compPath}/src/components/${name}.ts`, 'aui-example', id);
		replaceContent(`${compPath}/src/components/${name}.ts`, 'Example', name);

		console.log(compPath, 'created.');

		process.exit();
	});
}
