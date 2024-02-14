class resizeObserver {
	constructor(callback, element) {
		this.createResizeObserver(callback, element);

		return this;
	}

	createResizeObserver(callback, element) {
		if (element) {
			this.instance = new ResizeObserver((entries) => {
				// eslint-disable-line
				window.requestAnimationFrame(() => {
					if (Array.isArray(entries) && entries.length) {
						callback();
					}
				});
			});

			this.instance.observe(element);
		} else {
			console.error('resizeObserver: No element given.', this);
		}
	}

	destroyResizeObserver() {
		console.log('resizeObserver: Destroy.');

		if (this.instance) {
			this.instance.disconnect();
			this.instance = null;
		}
	}
}

const mergeDefaults = (config, defaults) => {
	if (config === null || config === undefined) return defaults;
	for (const attrname in defaults) {
		if (defaults[attrname].constructor === Object)
			config[attrname] = mergeDefaults(config[attrname], defaults[attrname]);
		else if (config[attrname] === undefined) config[attrname] = defaults[attrname];
	}
	return config;
};

const scale = (number, inMin, inMax, outMin, outMax) =>
	((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

const closest = (arr, num) =>
	arr.reduce((prev, current) => (Math.abs(current - num) <= Math.abs(prev - num) ? current : prev));

const closestPrevNext = (array, currentValue) => {
	if (array.length === 0) return null;

	const closestValue = array.reduce((prev, current) =>
		Math.abs(current - currentValue) <= Math.abs(prev - currentValue) ? current : prev
	);
	const closetIndex = array.findIndex((item) => item === closestValue);

	return {
		current: closestValue,
		prev: array[closetIndex - 1] ?? null,
		next: array[closetIndex + 1] ?? null,
	};
};

export { mergeDefaults, resizeObserver, scale, closest, closestPrevNext };
