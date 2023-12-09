import fs from 'fs';
import fg from 'fast-glob';

const publishOutputLog = '.task/publish.txt';

function getPackageTree() {
	const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	const packages = fg.sync(
		rootPackage.workspaces.map((p) => {
			return `${p}/package.json`;
		})
	);

	const tree = new Map();

	for (const pkg of packages) {
		const root = pkg.replace('/package.json', '');
		const pkgJson = JSON.parse(fs.readFileSync(pkg, 'utf8'));
		const changelog = `${root}/CHANGELOG.md`;
		if (!fs.existsSync(changelog)) {
			continue;
		}

		const log = fs.readFileSync(changelog, 'utf8');

		tree.set(pkgJson.name, {
			root: root,
			name: pkgJson.name,
			version: pkgJson.version,
			changelog: log,
		});
	}

	return tree;
}

function versionChanges(pkg, version) {
	const tree = getPackageTree();
	const info = tree.get(pkg);

	const changes = [];

	if (!info) {
		return changes;
	}

	let isVersion = false;
	for (const line of info.changelog.split('\n')) {
		if (line.startsWith('## ')) {
			isVersion = false;
		}

		if (isVersion) {
			changes.push(line);
		}

		if (line.startsWith(`## ${version}`)) {
			isVersion = true;
		}
	}

	return changes.join('\n');
}

function generateMesssage() {
	if (!fs.existsSync(publishOutputLog)) {
		console.warn('No publish output log found');
		return process.exit(1);
	}

	const publishOutput = fs.readFileSync(publishOutputLog, 'utf8');

	const publishedPackages = [
		...publishOutput.matchAll(/info Publishing "([@a-zA-Z\/-0-9]+)" at "([-.0-9a-z]+)"/g),
	];

	if (publishedPackages.length === 0) {
		console.warn('No packages published');
		return process.exit(1);
	}

	let message = '\n';

	for (const [_, pkg, version] of publishedPackages) {
		const changes = versionChanges(pkg, version);

		message += `\n🚀 Published ${pkg}@${version}\n`;
		message += `\n${changes}`;
	}

	return `${message}\n`;
}

console.log(generateMesssage());
