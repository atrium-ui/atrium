module.exports = {
	async getAddMessage(changeset) {
		return `version: ${changeset.summary}`;
	},
	async getVersionMessage(releasePlan) {
		return `publish: ${releasePlan.releases.length} packages

${releasePlan.releases
	.map(
		(release) => `## ${release.name}@${release.newVersion}

${release.changesets.map((changeset) => {
	const changes = releasePlan.changesets.find((cs) => cs.id === changeset);
	return changes.summary;
})}`,
	)
	.join("\n")}`;
	},
};
