// import { merge } from 'lodash-es'
import * as _ from 'lodash-es';

import Dragger from './dragger.js'; // './dragger.debug.js'
// import Dots from './slider.dots.js' // TODO

import { closestPrevNext, scale } from './utils/utils.js';

class Slider extends Dragger {
	constructor(element, options) {
		const defaults = _.merge(
			{
				initialIndex: 0,
				threshold: 0.1, // threshold to trigger next item
				mode: 'horizontal', // 'hoizontal' | 'vertical'
				gap: '10px',
				goByView: false,
				slidesToScroll: 3,
				slidesToShow: 3,
				center: true,
				centerSlides: false,
				variableHeight: false,
				variableWidth: false,
				overflow: false,
				overflowScrolling: true,
				arrows: true,
				rtl: false,
				dots: 'simple', // 'pager' | 'dragger'
				lock: { x: false, y: true },
				focusOnClick: true,
				// prevent (event) { return Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 0 && Math.abs(event.deltaY) < 10 },
				// prevent (event) { return Math.abs(event.deltaX) > 0 && Math.abs(event.deltaY) < 20 },
				prevent() {
					return false;
				},
				responsive: [
					// {
					//   breakpoint: 500, // 641,
					//   options: null,
					// },
					// {
					//   breakpoint: 768, // 641,
					//   options: {
					//     slidesToShow: 3,
					//     variableWidth: false,
					//     center: false
					//   },
					// },
					// {
					//   breakpoint: 1024, // 641,
					//   options: {
					//     slidesToShow: 4,
					//     variableWidth: false,
					//     center: true
					//   },
					// }
				],
			},
			options
		);

		super(element, defaults, false);

		this.boundedOnClickFn = this.onClick.bind(this);
		this.boundedOnKeyupFn = this.onKeyup.bind(this);
		this.boundedOnMouseenterFn = this.onMouseenter.bind(this);
		this.boundedOnMouseleaveFn = this.onMouseleave.bind(this);

		this.defaults = defaults;
		this.defaults.dots = this.defaults.dots === true ? 'simple' : this.defaults.dots;
		this.options = _.merge(this.options, this.defaults);

		// set children
		this.children = Array.from(this.element.children);

		// important to get keyevents working
		this.element.setAttribute('tabindex', 0);

		this.bindEvents();
		this.checkBreakpoints();
		this.setClassesAndAttributes();
		this.setCurrentIndex(this.options.initialIndex);
		this.updateStyles();

		// wait for styles
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				this.createContols();
				this.updateOffsets();
				this.updateBounds(); // update bounds
				this.goToIndex(this.currentIndex, 0); // jump to initial index

				this.options.onInit?.(this);
			});
		});

		return this;
	}

	createContols() {
		this.createContolsArrows();
		this.createContolsDots();
	}

	needsControls() {
		if (this.options.mode === 'horizontal') {
			return (
				this.options.center ||
				(this.children.length > this.calcSlidesToShow() &&
					this.element.clientWidth > this.options.container.clientWidth)
			);
		}
		return (
			this.options.center ||
			(this.children.length > this.calcSlidesToShow() &&
				this.element.clientHeight > this.options.container.clientHeight)
		);
	}

	createContolsArrows() {
		if (this.options.arrows) {
			if (this.needsControls()) {
				if (!this.containerArrows) {
					const containerArrowsPlaceholder =
						this.options.container.parentNode.querySelectorAll('.slider__arrows')[0];
					this.containerArrows =
						containerArrowsPlaceholder || document.createElement('div');
					if (!containerArrowsPlaceholder) {
						this.containerArrows.classList.add('slider__arrows');
						this.options.container.appendChild(this.containerArrows);
					}

					const containerArrowPrevPlaceholder =
						this.options.container.parentNode.querySelectorAll(
							'.slider__arrows-item--prev'
						)[0];
					this.containerArrowPrev =
						containerArrowPrevPlaceholder || document.createElement('div');
					this.containerArrowPrev.addEventListener('click', () => this.goToPrev(), false);
					if (this.currentIndex === 0)
						this.containerArrowPrev.classList.add('slider__arrows-item--disabled');
					if (!containerArrowPrevPlaceholder) {
						this.containerArrowPrev.classList.add('slider__arrows-item');
						this.containerArrowPrev.classList.add('slider__arrows-item--prev');
						this.containerArrowPrev.innerHTML = '<button>&lt;</button>';
						this.containerArrows.append(this.containerArrowPrev);
					}

					const containerArrowNextPlaceholder =
						this.options.container.parentNode.querySelectorAll(
							'.slider__arrows-item--next'
						)[0];
					this.containerArrowNext =
						containerArrowNextPlaceholder || document.createElement('div');
					this.containerArrowNext.addEventListener('click', () => this.goToNext(), false);
					if (this.currentIndex === this.children.length - this.calcSlidesToShow())
						this.containerArrowNext.classList.add('slider__arrows-item--disabled');
					if (!containerArrowPrevPlaceholder) {
						this.containerArrowNext.classList.add('slider__arrows-item');
						this.containerArrowNext.classList.add('slider__arrows-item--next');
						this.containerArrowNext.innerHTML = '<button>&gt;</button>';
						this.containerArrows.append(this.containerArrowNext);
					}
				}
			} else if (this.containerArrows) {
				this.containerArrows.parentNode.removeChild(this.containerArrows);
				this.containerArrows = null;
				this.containerArrowPrev = null;
				this.containerArrowNext = null;
			}
		}
	}

	calcSlidesToShow() {
		const gap = parseFloat(window.getComputedStyle(this.element).gap || 0);

		if (this.options.mode === 'horizontal') {
			return this.options.variableWidth
				? this.options.center
					? 1
					: this.children.reduce(
							(acc, child, index) => {
								acc.width += child.clientWidth + gap;
								if (acc.width < this.options.container.clientWidth) acc.count = index + 1;

								return acc;
							},
							{ width: 0, count: 0 }
					  ).count
				: this.options.slidesToShow;
		}
		return this.options.variableHeight
			? this.options.center
				? 1
				: this.children.reduce(
						(acc, child, index) => {
							acc.height += child.clientHeight + gap;
							if (acc.height < this.options.container.clientHeight) acc.count = index + 1;

							return acc;
						},
						{ height: 0, count: 0 }
				  ).count
			: this.options.slidesToShow;
	}

	createContolsDots() {
		// TODO
		// if (this.options.dots && !this.dots) {
		//   this.dots = new Dots(this.element, this.options)
		// }

		if (this.options.dots) {
			if (this.needsControls()) {
				const slidesToShow = this.calcSlidesToShow();

				if (!this.containerDots) {
					this.containerDotsItems = [];

					const containerDotsPlaceholder =
						this.options.container.parentNode.querySelectorAll('.slider__dots')[0];
					this.containerDots = containerDotsPlaceholder || document.createElement('div');
					this.containerDots.classList.add(`slider__dots--type-${this.options.dots}`);
					if (!containerDotsPlaceholder) {
						this.containerDots.classList.add('slider__dots');
						this.options.container.parentNode.appendChild(this.containerDots);
					}

					if (
						(this.options.goByView &&
							this.containerDotsItems.length !==
								Math.floor((this.children.length - 1) / slidesToShow) + 1) ||
						(!this.options.goByView &&
							this.containerDotsItems.length !== this.children.length - slidesToShow + 1)
					) {
						this.containerDots.innerHTML = '';
						this.containerDotsItems = [];

						if (this.children.length - slidesToShow > 0) {
							switch (this.options.dots) {
								case 'simple':
									this.children.forEach((child, index) => {
										if (
											this.options.center ||
											(this.options.goByView && index % slidesToShow === 0) ||
											(!this.options.goByView &&
												index <= this.children.length - slidesToShow)
										) {
											const dot = document.createElement('div');
											dot.classList.add('slider__dots-item');
											dot.innerHTML = `<button>${index + 1}</button>`;
											dot.setAttribute('data-index', index);
											dot.addEventListener('click', () => this.goToIndex(index), false);
											if (index === this.currentIndex)
												dot.classList.add('slider__dots-item--current');

											this.containerDots.append(dot);
											this.containerDotsItems.push(dot);
										}
									});
									break;
								case 'pager':
									break;
								case 'dragger': {
									// TODO
									this.children.forEach((child, index) => {
										// if (index <= this.children.length - slidesToShow) {
										if (
											this.options.center ||
											(this.options.goByView && index % slidesToShow === 0) ||
											(!this.options.goByView &&
												index <= this.children.length - slidesToShow)
										) {
											const dot = document.createElement('div');
											dot.classList.add('slider__dots-item');
											dot.innerHTML = `<button>${index + 1}</button>`;
											dot.setAttribute('data-index', index);
											dot.addEventListener('click', () => this.goToIndex(index), false);
											if (index === this.currentIndex)
												dot.classList.add('slider__dots-item--current');

											this.containerDots.append(dot);
											this.containerDotsItems.push(dot);
										}
									});

									const bar = document.createElement('div');
									bar.classList.add('slider__dots-bar');

									const barDragger = document.createElement('div');
									barDragger.classList.add('slider__dots-bar-dragger');
									barDragger.style.width = `${
										this.options.container.clientWidth /
										(this.children.length - slidesToShow + 1)
									}px`;

									bar.append(barDragger);
									this.containerDots.append(bar);

									class dotsDragger extends Dragger {
										constructor(element, options, context) {
											super(element, options);

											this.context = context;
										}
										calcSliderPosition() {
											const boundsDragger = this.checkBounds();

											const percentageDraggerMoved = scale(
												this.drag.x,
												boundsDragger.boundLeft,
												boundsDragger.boundRight,
												1,
												0
											);
											const boundsSlider = this.context.checkBounds();

											return scale(
												percentageDraggerMoved,
												0,
												1,
												boundsSlider.boundLeft,
												boundsSlider.boundRight
											);
										}
										translate(duration, sync = true) {
											super.translate.call(this, duration, false);

											if (sync) {
												this.context.drag.x = this.calcSliderPosition();
												this.context.translate.call(this.context, duration);
											}
										}
										onEnd(event) {
											if (this.isInteracting) {
												super.onEnd.call(this, event, false);

												this.context.drag.x = this.calcSliderPosition();
												this.context.snap.call(this.context);
											}
										}
										onResize(event) {
											super.onResize.call(this, event, false);

											// this.element.style.width = (this.options.container.clientWidth / (this.context.children.length - this.options.slidesToShow + 1)) + 'px'

											const boundsDragger = this.checkBounds();
											this.drag.x = scale(
												this.context.currentIndex / (this.context.children.length - 1),
												0,
												1,
												boundsDragger.boundLeft,
												boundsDragger.boundRight
											);

											this.translate(undefined, false);
										}
									}

									this.dotsDragger = new dotsDragger(
										barDragger,
										{
											autoResize: true,
											lock: { y: true },
											overflowScrolling: false,
											slidesToShow: slidesToShow,
											wheel: false,
										},
										this
									);
									break;
								}
							}
						}
					}
				}
			} else if (this.containerDots) {
				this.containerDots.parentNode.removeChild(this.containerDots);
				this.containerDots = null;

				this.element.style.transform = 'translate3d(0, 0, 0)';
				this.setCurrentIndex(0);
			}
		}
	}

	setCurrentIndex(index) {
		const slidesToShow = this.calcSlidesToShow();
		const currentIndexOld = this.currentIndex;

		// handle undefined index given by closestElement check
		index = index !== undefined ? index : this.currentIndex;

		// update restricted index
		this.currentIndex = Math.max(
			Math.min(index, this.children.length - (this.options.center ? 1 : slidesToShow)),
			0
		);

		// set arrows
		if (this.containerArrows) {
			const prevAction =
				this.containerArrowPrev && this.currentIndex === 0 ? 'add' : 'remove';
			this.containerArrowPrev.classList[prevAction]('slider__arrows-item--disabled');

			const nextAction =
				this.containerArrowNext &&
				this.currentIndex >=
					this.children.length -
						slidesToShow +
						(this.options.center ? slidesToShow - 1 : 0)
					? 'add'
					: 'remove';
			this.containerArrowNext.classList[nextAction]('slider__arrows-item--disabled');
		}

		// set active dot
		if (this.containerDots && this.containerDotsItems.length) {
			const currentDots = this.containerDotsItems.filter(
				(dotsItem) =>
					this.currentIndex >=
					Math.max(0, parseInt(dotsItem.getAttribute('data-index')) + 1 - slidesToShow)
			);
			const currentDot =
				this.currentIndex === 0
					? currentDots[0]
					: this.options.goByView
					  ? currentDots[currentDots.length - 1]
					  : this.containerDotsItems[this.currentIndex];
			const otherDots = this.containerDotsItems.filter(
				(dotsItem) => dotsItem !== currentDot
			);

			otherDots.forEach((child) => child.classList.remove('slider__dots-item--current'));
			if (currentDot && !currentDot.classList.contains('slider__dots-item--current'))
				currentDot.classList.add('slider__dots-item--current');
		}

		// trigger change event when current index changed
		if (this.currentIndex !== currentIndexOld) {
			this.children.forEach((child, childIndex) => {
				if (childIndex === this.currentIndex) {
					child.classList.add('active');
				} else {
					child.classList.remove('active');
				}
			});

			this.options.onChange?.(this, currentIndexOld, this.currentIndex);
		}
	}

	setClassesAndAttributes() {
		this.options.container.setAttribute('tabIndex', 0);
		this.options.container.parentNode.classList.add('slider--is-mounted');
		this.options.container.parentNode.classList.add(`slider--${this.options.mode}`);

		this.options.overflow
			? this.options.container.parentNode.classList.add('slider--overflow')
			: this.options.container.parentNode.classList.remove('slider--overflow');
		this.options.rtl
			? this.options.container.parentNode.classList.add('slider--rtl')
			: this.options.container.parentNode.classList.remove('slider--rtl');
		this.options.variableWidth
			? this.options.container.parentNode.classList.add('slider--variable-width')
			: this.options.container.parentNode.classList.remove('slider--variable-width');
		this.options.variableHeight
			? this.options.container.parentNode.classList.add('slider--variable-height')
			: this.options.container.parentNode.classList.remove('slider--variable-height');
		if (!this.options.center)
			this.options.centerSlides
				? this.options.container.parentNode.classList.add('slider--center-slides')
				: this.options.container.parentNode.classList.remove('slider--center-slides');
	}

	updateOffsets() {
		if (this.options.mode === 'horizontal') {
			this.options = _.merge(this.options, {
				offsets: {
					left: this.options.center
						? this.options.container.clientWidth / 2 -
						  this.element.firstElementChild.clientWidth / 2
						: 0, // breaks slider when node is #text so use firstElementChild
					right: this.options.center
						? this.options.container.clientWidth / 2 -
						  this.element.lastElementChild.clientWidth / 2
						: 0, // breaks slider when node is #text so use lastElementChild
				},
			});
		} else {
			this.options = _.merge(this.options, {
				offsets: {
					top: this.options.center
						? this.options.container.clientHeight / 2 -
						  this.element.firstElementChild.clientHeight / 2
						: 0, // breaks slider when node is #text so use firstElementChild
					bottom: this.options.center
						? this.options.container.clientHeight / 2 -
						  this.element.lastElementChild.clientHeight / 2
						: 0, // breaks slider when node is #text so use lastElementChild
				},
			});
		}

		// super.updateOffsets.call(this, {})
	}

	bindEvents() {
		super.bindEvents.call(this);

		// this.element.addEventListener('click', this.boundedOnClickFn, false)
		Array.from(this.element.querySelectorAll('a, :scope > *')).forEach((link) =>
			link.addEventListener('click', this.boundedOnClickFn, true)
		);

		this.options.container.addEventListener('keyup', this.boundedOnKeyupFn, false);
		this.options.container.addEventListener(
			'mouseenter',
			this.boundedOnMouseenterFn,
			false
		);
		this.options.container.addEventListener(
			'mouseleave',
			this.boundedOnMouseleaveFn,
			false
		);
	}

	unbindEvents() {
		super.unbindEvents.call(this);

		// this.element.removeEventListener('click', this.boundedOnClickFn)
		Array.from(this.element.querySelectorAll('a, :scope > *')).forEach((link) =>
			link.removeEventListener('click', this.boundedOnClickFn)
		);

		this.options.container.removeEventListener('keyup', this.boundedOnKeyupFn);
		this.options.container.removeEventListener('mouseenter', this.boundedOnMouseenterFn);
		this.options.container.removeEventListener('mouseleave', this.boundedOnMouseleaveFn);
	}

	destroy() {
		super.destroy.call(this);

		this.unbindEvents();
	}

	getPostitionByChild(child) {
		if (child) {
			let offsetY = -child.offsetTop;

			if (this.options.rtl) {
				const offsetX =
					this.element.clientWidth -
					this.options.container.clientWidth -
					child.offsetLeft;
				offsetY = -child.offsetTop;

				if (this.options.center) {
					return {
						x: offsetX + (this.options.container.clientWidth / 2 - child.clientWidth / 2),
						y: offsetY,
					};
				}
				return {
					x: offsetX + (this.options.container.clientWidth - child.clientWidth),
					y: offsetY,
				};
			}
			const offsetX = -child.offsetLeft;
			// offsetY = this.element.clientHeight - this.options.container.clientHeight - child.offsetTop

			if (this.options.center) {
				return {
					x: offsetX + (this.options.container.clientWidth / 2 - child.clientWidth / 2),
					y: offsetY + (this.options.container.clientHeight / 2 - child.clientHeight / 2),
				};
			}
			return {
				x: offsetX,
				y: offsetY,
			};
		}
		return {
			x: 0,
			y: 0,
		};
	}

	goTo(node, duration, force = false) {
		if (node) {
			// wait for child position!
			requestAnimationFrame(() => {
				const nodeIndex = this.children.findIndex((child) => child === node);

				if (nodeIndex !== this.currentIndex || force) {
					this.setCurrentIndex(this.children.findIndex((child) => child === node));

					const targetPosition = this.getPostitionByChild(node);
					this.drag.x = targetPosition.x;
					this.drag.y = targetPosition.y;

					this.translate(duration, true);
				}
			});
		}

		return this.currentIndex;
	}

	goToIndex(index, duration) {
		if (index !== undefined && !Number.isNaN(index)) {
			// TODO catch NaN values with vue3
			const indexFound = this.children.findIndex(
				(child, childIndex) => childIndex === index
			);

			if (indexFound > -1) {
				this.goTo(this.children[indexFound], duration, true);
				console.info(`Slider:goToIndex: Index "${index}" found.`);
			} else {
				console.error(`Slider:goToIndex: Index "${index}" not found.`);
			}
		}

		return this.currentIndex;
	}

	goToClosestElement() {
		const { element, index } = this.getClosestElementByCoords(this.drag.x, this.drag.y);

		if (element) {
			// this.setCurrentIndex(index)

			// toggle classes
			this.children.forEach((child) => child.classList.remove('current'));
			this.children[this.currentIndex].classList.add('current');

			this.goTo(element);
			console.info(`Slider:goToClosestElement: Element "${element}" found.`);
		} else {
			console.error(
				'Slider:goToClosestElement: No closest element found.',
				this.drag.x,
				this.drag.y,
				this.children
			);
		}
	}

	goToPrev() {
		const index = Math.max(0, this.currentIndex - this.options.slidesToScroll); // Math.max(0, this.currentIndex - this.options.slidesToScroll)
		const element = this.children[index];

		if (element) {
			this.goTo(element);

			console.info(`Slider:goToPrev: Element "${element}" found.`);
		}
	}

	goToNext() {
		const index = Math.min(
			this.children.length - 1,
			this.currentIndex + this.options.slidesToScroll
		); // Math.min(this.children.length - 1, this.currentIndex + this.options.slidesToScroll)
		const element = this.children[index];

		if (element) {
			this.goTo(element);

			console.info(`Slider:goToNext: Element "${element}" found.`);
		}
	}

	getClosestElementByCoords(x, y) {
		const gap = parseFloat(window.getComputedStyle(this.element).gap || 0) / 2;
		const bound = this.checkBounds(x, y);

		// get closest element
		const element = this.children.find((child, childIndex) => {
			// eslint-disable-line
			const position = this.getPostitionByChild(child);

			// center: // return x > position.x - child.clientWidth / 2 - gap && x < position.x + child.clientWidth / 2 + gap
			// left: // return x > position.x - (child.clientWidth / 2) - gap && x < position.x + child.clientWidth + gap

			if (this.options.mode === 'horizontal') {
				if (this.options.rtl) {
					if (this.options.center) {
						return (
							bound.x < position.x + child.clientWidth / 2 + gap &&
							bound.x > position.x - child.clientWidth / 2 - gap
						);
					}
					return (
						bound.x < position.x + child.clientWidth / 2 - gap &&
						bound.x > position.x - child.clientWidth + gap
					);
				}
				// eslint-disable-next-line no-lonely-if
				if (this.options.center) {
					return (
						bound.x > position.x - child.clientWidth / 2 - gap &&
						bound.x < position.x + child.clientWidth / 2 + gap
					);
				}
				return (
					bound.x > position.x - child.clientWidth / 2 - gap &&
					bound.x < position.x + child.clientWidth + gap
				);
			}
			// eslint-disable-next-line no-lonely-if
			if (this.options.center) {
				return (
					bound.y > position.y - child.clientHeight / 2 - gap &&
					bound.y < position.y + child.clientHeight / 2 + gap
				);
			}
			return (
				bound.y > position.y - child.clientHeight / 2 - gap &&
				bound.y < position.y + child.clientHeight + gap
			);
		});

		if (!element)
			console.warn('Slider:getClosestElementByCoords: No closest element found.', bound);

		return {
			element,
			index: element && this.children.findIndex((child) => child === element),
		};
	}

	onClick(event) {
		if (this.isMoving) {
			event.preventDefault();
		} else {
			if (this.options.focusOnClick) {
				this.goTo(event.target.closest('.slider__list-item'));
			}
		}
	}

	onKeyup(event) {
		switch (event.key) {
			case 'ArrowLeft':
				if (this.options.mode === 'horizontal') this.goToPrev();
				break;
			case 'ArrowRight':
				if (this.options.mode === 'horizontal') this.goToNext();
				break;
			case 'ArrowUp':
				if (this.options.mode === 'vertical') this.goToPrev();
				break;
			case 'ArrowDown':
				if (this.options.mode === 'vertical') this.goToNext();
				break;
		}
	}

	onMouseenter() {
		const isInteractable =
			this.options.mode === 'horizontal'
				? this.options.center ||
				  this.element.clientWidth > this.options.container.clientWidth
				: this.options.center ||
				  this.element.clientHeight > this.options.container.clientHeight;

		if (isInteractable) {
			this.options.container.focus({ preventScroll: true });
		}
	}

	onMouseleave() {
		const isInteractable =
			this.options.mode === 'horizontal'
				? this.options.center ||
				  this.element.clientWidth > this.options.container.clientWidth
				: this.options.center ||
				  this.element.clientHeight > this.options.container.clientHeight;

		if (isInteractable) {
			this.options.container.blur();
		}
	}

	onStart(event) {
		super.onStart.call(this, event, false);

		this.currentIndexStart = this.currentIndex;

		// trigger callback
		this.options.onStart?.(event, this);
	}

	onMove(event) {
		const isInteractable =
			this.options.mode === 'horizontal'
				? this.options.center ||
				  this.element.clientWidth > this.options.container.clientWidth
				: this.options.center ||
				  this.element.clientHeight > this.options.container.clientHeight;

		if (this.isInteracting && isInteractable) {
			super.onMove.call(this, event, false);

			// trigger callback
			this.options.onMove?.(event, this);
		}
	}

	onEnd(event) {
		const isInteractable =
			this.options.mode === 'horizontal'
				? this.options.center ||
				  this.element.clientWidth > this.options.container.clientWidth
				: this.options.center ||
				  this.element.clientHeight > this.options.container.clientHeight;

		if (this.isInteracting && isInteractable) {
			super.onEnd.call(this, event, false);

			if (this.options.snap) this.snap();

			this.currentIndexStart = null;

			// trigger callback
			this.options.onEnd?.(event, this);
		}
	}

	checkBreakpoints() {
		const breakpointsTests = this.options.responsive
			.sort((a, b) => b.breakpoint - a.breakpoint)
			.map(
				(responsiveItem) =>
					window.matchMedia(
						`(${responsiveItem.type || 'max'}-width: ${responsiveItem.breakpoint}px)`
					).matches
			);
		const breakpointTestIndex = breakpointsTests.lastIndexOf(true);

		if (breakpointTestIndex !== -1) {
			if (this.options.responsive[breakpointTestIndex].options === 'disable') {
				if (!this.options.container.parentNode.classList.contains('slider--disabled')) {
					this.options.container.parentNode.classList.add('slider--disabled');
					this.unbindEvents();
				}
			} else {
				if (this.options.container.parentNode.classList.contains('slider--disabled')) {
					this.options.container.parentNode.classList.remove('slider--disabled');
					this.bindEvents();
				}

				this.options = _.merge(
					this.options,
					this.options.responsive[breakpointTestIndex].options
				);
			}
		} else {
			if (this.options.container.parentNode.classList.contains('slider--disabled')) {
				this.options.container.parentNode.classList.remove('slider--disabled');
				this.bindEvents();
			}

			this.options = _.merge(this.options, this.defaults);
		}
	}

	onResize(event) {
		this.isResizing = true;
		this.currentIndexBeforeResize =
			this.currentIndexBeforeResize !== null
				? this.currentIndexBeforeResize
				: this.currentIndex;
		// this.element.style.setProperty('opacity', 0)

		this.checkBreakpoints();
		this.updateStyles();

		// wait until breakpoint changes are applied
		requestAnimationFrame(() => {
			super.onResize.call(this, event, false);

			if (this.timerResize) {
				clearTimeout(this.timerResize);
				this.timerResize = null;
			}

			this.timerResize = setTimeout(() => {
				const currentIndex = this.currentIndexBeforeResize ?? this.currentIndex;

				// set currentIndex to lastIndex
				this.setCurrentIndex(currentIndex);
				this.createContols();

				// // TODO set position directly
				// const targetPosition = this.getPostitionByChild(this.children[currentIndex])
				// const targetBound = this.checkBounds(targetPosition.x, targetPosition.y)
				// this.drag.x = targetBound.x
				// this.drag.y = targetBound.y
				// this.element.style.transform = `translate3d(${this.drag.x}px, ${this.drag.y}px, 0)`
				// this.element.style.transition = `transform 0.1s ease`

				this.goToIndex(this.currentIndex);

				this._wasLastIndex = null;
				this.isResizing = false;
				this.currentIndexBeforeResize = null;

				// trigger callback
				this.options.onResize?.(event, this);
			}, 150);
		});
	}

	onWheel(event) {
		if (
			this.options.center ||
			this.element.clientWidth > this.options.container.clientWidth
		) {
			super.onWheel.call(this, event);

			this.maxDistX = Math.max(Math.abs(this.dist.x), this.maxDistX || 0);
			this.maxDistY = Math.max(Math.abs(this.dist.y), this.maxDistY || 0);

			if (this.currentIndexStart === null || this.currentIndexStart === undefined)
				this.currentIndexStart = this.currentIndex;

			if (this.options.snap) {
				if (this.timerWheel) {
					clearTimeout(this.timerWheel);
					this.timerWheel = null;
				}

				this.timerWheel = setTimeout(() => {
					this.snap(this.maxDistX > 3);

					this.maxDistX = 0;
					this.maxDistY = 0;

					this.currentIndexStart = null;
				}, 150);
			}
		}
	}

	snap(force = false) {
		if (this.options.snap) {
			let { index } = this.getClosestElementByCoords(this.drag.x, this.drag.y);
			const bound = this.checkBounds(this.drag.x, this.drag.x);
			const slidesToShow = this.calcSlidesToShow();
			const slidesToShowSnapSteps = this.options.goByView ? slidesToShow : 1;
			const slidesToShowSnapIndecies = Array.from(
				{ length: Math.ceil(this.children.length / slidesToShowSnapSteps) },
				(v, i) => i * slidesToShowSnapSteps
			);
			const closestIndecies = closestPrevNext(slidesToShowSnapIndecies, index);

			// update index always to respect goToView option
			index = closestIndecies.current;

			// if forced by mousewheel or threshold is reached
			if (
				force ||
				Math.abs(this.dist.x) / this.options.container.clientWidth >
					this.options.threshold
			) {
				if (this.options.mode === 'horizontal') {
					// if same index on start or current index is not in snap indecies go to next/prev slide/page
					if (
						this.currentIndexStart === closestIndecies.current ||
						!slidesToShowSnapIndecies.includes(this.currentIndexStart)
					) {
						const direction = Math.sign(this.dist.x) * (this.options.rtl ? 1 : -1);
						const isSubIndex = this.currentIndexStart > closestIndecies.current; // this.currentIndexStart !== closestIndecies.current && !(bound.lockLeft || bound.lockRight)

						index = isSubIndex
							? closestIndecies.current
							: (direction > 0 ? closestIndecies.next : closestIndecies.prev) ??
							  closestIndecies.current;

						// console.log('isSubIndex', index, isSubIndex, this.currentIndexStart, closestIndecies)
					}
				} else if (this.options.mode === 'vertical') {
					if (
						this.currentIndexStart === closestIndecies.current ||
						!slidesToShowSnapIndecies.includes(this.currentIndexStart)
					) {
						index =
							Math.sign(this.dist.y) * -1 > 0
								? closestIndecies.next
								: !slidesToShowSnapIndecies.includes(this.currentIndexStart)
								  ? closestIndecies.current
								  : closestIndecies.prev; // Math.max(Math.min(this.options.rtl ? index + Math.sign(this.dist.x) : index - Math.sign(this.dist.x), this.children.length - 1), 0)
					}
				}
			}

			const targetPosition = this.getPostitionByChild(this.children[index]);
			const targetBound = this.checkBounds(targetPosition.x, targetPosition.y);
			this.drag.x = targetBound.x;
			this.drag.y = targetBound.y;

			this.translate();
		}
	}

	translate(duration) {
		if (
			this.options.center ||
			this.element.clientWidth > this.options.container.clientWidth ||
			this.element.clientHeight > this.options.container.clientHeight
		) {
			super.translate.call(this, duration);
		} else {
			this.drag.x = 0;
			this.drag.y = 0;

			super.translate.call(this, 0);
		}
	}

	onTranslate() {
		super.onTranslate.call(this, false);

		// update current index
		if (!this.isResizing)
			this.setCurrentIndex(
				this.getClosestElementByCoords(this.drag.x, this.drag.y).index
			);

		// update dots dragger
		if (this.dotsDragger) {
			const boundsDragger = this.dotsDragger.checkBounds();

			if (!this.isInteracting) {
				this.dotsDragger.drag.x = scale(
					this.currentIndex / (this.children.length - 1),
					0,
					1,
					boundsDragger.boundLeft,
					boundsDragger.boundRight
				);
			} else {
				const boundsSlider = this.checkBounds();
				const percentageSliderMoved = scale(
					this.drag.x,
					boundsSlider.boundLeft,
					boundsSlider.boundRight,
					1,
					0
				);

				this.dotsDragger.drag.x = scale(
					percentageSliderMoved,
					0,
					1,
					boundsDragger.boundLeft,
					boundsDragger.boundRight
				);
			}

			this.dotsDragger.translate.call(this.dotsDragger, undefined, false);
		}

		// trigger callback
		this.options.onTranslate?.(this.drag.x, this.drag.y, this);
	}

	updateStyles() {
		requestAnimationFrame(() => {
			const styles = {
				'--gap': this.options.gap,
				'--slidesCount': this.children.length,
				'--slidesToShow': this.calcSlidesToShow(), // this.options.slidesToShow,
				'--parentWidth': `${this.options.container.clientWidth}px`,
				'--parentHeight': `${this.options.container.clientHeight}px`,
			};

			// set slide styles
			for (const key in styles)
				this.options.container.parentNode.style.setProperty(key, styles[key]);

			// wait for children to be rendered
			requestAnimationFrame(() => {
				if (this.options.mode === 'horizontal') {
					const trackWidth = this.children.reduce(
						(acc, child) => (acc += child.getBoundingClientRect().width),
						0
					);
					this.options.container.parentNode.style.setProperty(
						'--trackWidth',
						`${trackWidth}px`
					);
				} else {
					const trackHeight = this.children.reduce(
						(acc, child) => (acc += child.getBoundingClientRect().height),
						0
					);
					this.options.container.parentNode.style.setProperty(
						'--trackHeight',
						`${trackHeight}px`
					);
				}
			});
		});
	}
}

export default Slider;
