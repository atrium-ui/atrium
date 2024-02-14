import Dragger from './dragger.js';

class DraggerDebug extends Dragger {
	constructor(element, options) {
		super(element, options);

		this.createMarker();

		return this;
	}

	destroy() {
		super.destroy.call(this);

		try {
			this.options.container.removeChild(this.markerAnchorVertical);
		} catch (e) {}
		try {
			this.options.container.removeChild(this.markerAnchorHorizontal);
		} catch (e) {}
		try {
			this.options.container.removeChild(this.markerOffsetLeft);
		} catch (e) {}
		try {
			this.options.container.removeChild(this.markerOffsetRight);
		} catch (e) {}
		try {
			this.options.container.removeChild(this.markerOffsetTop);
		} catch (e) {}
		try {
			this.options.container.removeChild(this.markerOffsetBottom);
		} catch (e) {}
	}

	createMarker() {
		this.options.container.style.position = 'relative';

		this.markerAnchorVertical = document.createElement('div');
		this.markerAnchorVertical.style.position = 'absolute';
		this.markerAnchorVertical.style.top = '50%';
		this.markerAnchorVertical.style.left = `${
			this.options.center
				? this.options.container.clientWidth / 2
				: this.options.rtl
				  ? this.options.container.clientWidth
				  : 0
		}px`;
		this.markerAnchorVertical.style.height = '25%';
		this.markerAnchorVertical.style.transform = 'translateY(-50%)';
		this.markerAnchorVertical.style.border = '1px dashed red';
		this.markerAnchorVertical.style.zIndex = 1;
		this.options.container.appendChild(this.markerAnchorVertical);

		this.markerAnchorHorizontal = document.createElement('div');
		this.markerAnchorHorizontal.style.position = 'absolute';
		this.markerAnchorHorizontal.style.top = `${
			this.options.center ? this.options.container.clientHeight / 2 : 0
		}px`;
		this.markerAnchorHorizontal.style.left = '50%';
		this.markerAnchorHorizontal.style.width = '25%';
		this.markerAnchorHorizontal.style.transform = 'translateX(-50%)';
		this.markerAnchorHorizontal.style.border = '1px dashed red';
		this.markerAnchorHorizontal.style.zIndex = 1;
		this.options.container.appendChild(this.markerAnchorHorizontal);

		this.markerOffsetLeft = document.createElement('div');
		this.markerOffsetLeft.style.position = 'absolute';
		this.markerOffsetLeft.style.top = 0;
		this.markerOffsetLeft.style.left = `${
			this.options.rtl ? this.options.offsets.right : this.options.offsets.left
		}px`;
		this.markerOffsetLeft.style.height = '100%';
		this.markerOffsetLeft.style.border = '1px dashed blue';
		this.options.container.appendChild(this.markerOffsetLeft);

		this.markerOffsetRight = document.createElement('div');
		this.markerOffsetRight.style.position = 'absolute';
		this.markerOffsetRight.style.top = 0;
		this.markerOffsetRight.style.right = `${
			this.options.rtl ? this.options.offsets.left : this.options.offsets.right
		}px`;
		this.markerOffsetRight.style.height = '100%';
		this.markerOffsetRight.style.border = '1px dashed green';
		this.options.container.appendChild(this.markerOffsetRight);

		this.markerOffsetTop = document.createElement('div');
		this.markerOffsetTop.style.position = 'absolute';
		this.markerOffsetTop.style.top = `${this.options.offsets.top}px`;
		this.markerOffsetTop.style.left = 0;
		this.markerOffsetTop.style.width = '100%';
		this.markerOffsetTop.style.border = '1px dashed blue';
		this.options.container.appendChild(this.markerOffsetTop);

		this.markerOffsetBottom = document.createElement('div');
		this.markerOffsetBottom.style.position = 'absolute';
		this.markerOffsetBottom.style.bottom = `${this.options.offsets.bottom}px`;
		this.markerOffsetBottom.style.left = 0;
		this.markerOffsetBottom.style.width = '100%';
		this.markerOffsetBottom.style.border = '1px dashed green';
		this.options.container.appendChild(this.markerOffsetBottom);
	}

	updateMarker() {
		this.markerAnchorVertical.style.left = `${
			this.options.center
				? this.options.container.clientWidth / 2
				: this.options.rtl
				  ? this.options.container.clientWidth
				  : 0
		}px`;
		this.markerOffsetLeft.style.left = `${
			this.options.rtl ? this.options.offsets.right : this.options.offsets.left
		}px`;
		this.markerOffsetRight.style.right = `${
			this.options.rtl ? this.options.offsets.left : this.options.offsets.right
		}px`;
		this.markerOffsetTop.style.top = `${this.options.offsets.top}px`;
		this.markerOffsetBottom.style.bottom = `${this.options.offsets.bottom}px`;
	}

	onResize(event) {
		super.onResize.call(this, event);

		this.updateMarker();
	}

	updateOffsets(offsets) {
		super.updateOffsets.call(this, offsets);

		this.updateMarker();
	}
}

export default DraggerDebug;
