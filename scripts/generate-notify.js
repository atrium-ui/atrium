import fs from 'fs';

const publishOutputLog = '.task/publish.txt';

function parseChangelog() {
	// recursvilery search for "CHANGELOG" files
}

function generateMesssage() {
	if (!fs.existsSync(publishOutputLog)) {
		throw new Error('No publish output log found');
	}

	const publishOutput = fs.readFileSync(publishOutputLog, 'utf8');

	const publishedPackages = publishOutput.matchAll(
		/info Publishing "([@a-zA-Z\/-0-9]+)" at "([-.0-9a-z]+)"/g
	);

	let message = '\n';

	for (const [_, pkg, version] of publishedPackages) {
		parseChangelog(pkg, version);
		message += `Published ${pkg}@${version}\n`;
	}

	return `${message}\n`;
}

console.log(generateMesssage());
