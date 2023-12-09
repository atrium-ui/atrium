import { CommitFunctions } from '@changesets/types';

export default (<CommitFunctions>{
	async getAddMessage() {
		return 'chore: add %s';
	},
	async getVersionMessage(releasePlan, commitOptions) {
		return 'chore: version %s';
	},
});
