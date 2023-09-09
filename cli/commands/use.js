import { resolve } from 'path';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import prompts from 'prompts';

const args = process.argv.slice(2);

const dist = resolve('./src/components');

const componentRoot = resolve(__dirname, '../../components/');

function component(name) {
  return resolve(componentRoot, `${name}.tsx`);
}

export default async function () {
  const components = [];

  if (args[1]) {
    components.push(args[1]);
  }

  if (components.length === 0) {
    const options = readdirSync(componentRoot)
      .filter((file) => file.match('.tsx'))
      .map((file) => file.replace('.tsx', ''));

    const { component } = await prompts([
      {
        type: 'multiselect',
        name: 'component',
        message: 'Pick components you want to use',
        instructions: false,
        min: 1,
        choices: options,
      },
    ]);

    components.push(...component.map((index) => options[index]));
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
