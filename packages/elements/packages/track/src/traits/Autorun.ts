import { InputState } from '../Track.js';
import { Trait } from '../Trait.js';
import { Ease, Vec, isTouch, timer } from '../utils.js';

export class AutorunTrait extends Trait {
	defaultSpeed = 1;
	defaultPauesTransitionTime = 1500;

	speed = new Vec(this.defaultSpeed, this.defaultSpeed);
	dir = new Vec(-1, -1);
	pauseTransitionTime = this.defaultPauesTransitionTime;

	paused = false;
	transitionAt = Date.now();

	pause() {
		this.paused = true;
		this.transitionAt = Date.now();
	}

	unpause() {
		this.paused = false;
		this.transitionAt = Date.now();
		this.entity.setTarget(undefined);
	}

	input(inputState: InputState) {
		if (inputState.move.value.abs()) {
			this.dir.set(inputState.move.value).sign();
		}

		if (inputState.enter.value) {
			!isTouch() && this.pause();
		}

		if (inputState.leave.value) {
			!isTouch() && this.unpause();
		}

		if (inputState.format.value) {
			if (isTouch()) {
				!this.paused && this.pause();
			} else {
				this.paused && this.unpause();
			}
		}
	}

	public update() {
		const entity = this.entity;
		if (!this.paused) {
			const transitionTime = timer(this.transitionAt, this.pauseTransitionTime);
			entity.inputForce
				.add(this.speed)
				.mul(this.dir)
				.mul(Ease.easeOutSine(transitionTime))
				.mul(entity.normal);
		}
	}
}
