module.exports = {
	async getAddMessage(changeset) {
		return `version: ${changeset.summary}`;
	},
	async getVersionMessage(releasePlan) {
		return `version: publishing ${releasePlan.releases.length} packages

${releasePlan.releases.map((release) => `- ${release.name}@${release.newVersion}`).join('\n')}
`;
	},
};