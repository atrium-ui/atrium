// import { merge } from 'lodash-es'
import * as _ from 'lodash-es';

// import Dragger from './dragger.debug.js'

// class dotDraggerClass extends Dragger {
//   constructor (element, options) {
//     super(element, options)
//   }
//   scale (number, inMin, inMax, outMin, outMax) {
//     return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
//   }
//   translate (drag, duration, sync = true) {
//     super.translate.call(this, true)

//     if (sync) {
//       const boundsDragger = this.checkBounds()
//       const percentageDraggerMoved = scale(this.drag.x, boundsDragger.boundLeft, boundsDragger.boundRight, 1, 0)
//       const boundsSlider = slider.checkBounds()

//       slider.drag.x = scale(percentageDraggerMoved, 0, 1, boundsSlider.boundLeft, boundsSlider.boundRight)
//       slider.translate.call(slider, true)
//     }
//   }
//   onEnd () {
//     super.onEnd.call(this)

//     const boundsDragger = this.checkBounds()
//     const percentageDraggerMoved = scale(this.drag.x, boundsDragger.boundLeft, boundsDragger.boundRight, 1, 0)
//     const boundsSlider = slider.checkBounds()

//     slider.drag.x = scale(percentageDraggerMoved, 0, 1, boundsSlider.boundLeft, boundsSlider.boundRight)
//     slider.snap.call(slider)
//   }
// }

// class SliderDots extends Dragger {
class SliderDots {
	constructor(element, options) {
		this.element = element;
		this.container = this.element.parentNode;
		this.children = Array.from(this.element.children);

		this.options = _.merge(
			{
				center: false,
				slidesToShow: 1,
				type: 'dots', // 'pager' | 'dragger'
				variableWidth: false,
			},
			options
		);

		this.create2();
	}

	create2() {
		if (this.options.center || this.element.clientWidth > this.container.clientWidth) {
			const gap = parseFloat(window.getComputedStyle(this.element).gap || 0);
			const slidesToShow = this.options.variableWidth
				? this.options.center
					? 1
					: this.children.reduce(
							(acc, child, index) => {
								acc.width += child.getBoundingClientRect().width + gap;
								if (acc.width < this.container.clientWidth) acc.count = index + 1;

								return acc;
							},
							{ width: 0, count: 0 }
					  ).count
				: this.options.center
				  ? 1
				  : this.options.slidesToShow;

			if (!this.containerDots) {
				console.warn('createDeots');
				this.containerDots = document.createElement('div');
				this.containerDots.classList.add('slider__dots');
				this.container.parentNode.appendChild(this.containerDots);
			}

			if (
				this.containerDots.children.length - 1 !==
				this.children.length - slidesToShow
			) {
				this.containerDots.innerHTML = '';

				if (this.children.length - slidesToShow > 0) {
					switch (this.options.type) {
						case 'dots': // simple dots
							this.children.forEach((child, index) => {
								if (index <= this.children.length - slidesToShow) {
									const dot = document.createElement('dot');
									dot.classList.add('slider__dots-item');
									dot.innerHTML = index + 1;
									dot.addEventListener('click', () => this.goToIndex(index), false);
									if (index === this.currentIndex)
										dot.classList.add('slider__dots-item--current');

									this.containerDots.append(dot);
								}
							});
							break;
						case 'pager':
							return;
						case 'dragger':
							return;
					}
				}
			}
		} else {
			// this.destroy()
			this.containerDots.innerHTML = '';
		}
	}

	destroy() {
		if (this.containerDots) {
			this.containerDots.parentNode.removeChild(this.containerDots);
		}
	}

	// create () {
	//   if (this.options.center || this.element.clientWidth > this.container.clientWidth) {
	//     const gap = parseFloat(window.getComputedStyle(this.element).gap || 0)
	//     const slidesToShow = this.options.variableWidth ? this.options.center ? 1 : this.children.reduce((acc, child, index) => {
	//       acc.width += child.getBoundingClientRect().width + gap
	//       if (acc.width < this.container.clientWidth) acc.count = index + 1

	//       return acc
	//     }, { width: 0, count: 0 }).count : this.options.center ? 1 : this.options.slidesToShow

	//     if (!this.containerDots) {
	//       this.containerDots = document.createElement('div')
	//       this.containerDots.classList.add('slider__dots')
	//       this.container.parentNode.appendChild(this.containerDots)
	//     }

	//     if (this.containerDots.children.length - 1 !== this.children.length - slidesToShow) {
	//       this.containerDots.innerHTML = ''

	//       if (this.children.length - slidesToShow > 0) {
	//         // simple dots
	//         this.children.forEach((child, index) => {
	//           if (index <= this.children.length - slidesToShow) {
	//             const dot = document.createElement('dot')
	//             dot.classList.add('slider__dots-item')
	//             dot.innerHTML = index + 1
	//             dot.addEventListener('click', () => this.goToIndex(index), false)
	//             if (index === this.currentIndex) dot.classList.add('slider__dots-item--current')

	//             this.containerDots.append(dot)
	//           }
	//         })

	//         // const bar = document.createElement('div')
	//         // bar.classList.add('slider__dots-bar')

	//         // const barDragger = document.createElement('div')
	//         // barDragger.classList.add('slider__dots-bar-dragger')
	//         // barDragger.style.width = (this.container.clientWidth / (this.children.length - slidesToShow + 1)) + 'px'

	//         // bar.append(barDragger)
	//         // this.containerDots.append(bar)

	//         // const slider = this
	//         // const dotDragger = class dotDraggerClass extends Dragger {
	//         //   constructor (element, options) {
	//         //     super(element, options)
	//         //   }
	//         //   scale (number, inMin, inMax, outMin, outMax) {
	//         //     return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	//         //   }
	//         //   translate (drag, duration, sync = true) {
	//         //     super.translate.call(this, true)

	//         //     if (sync) {
	//         //       const boundsDragger = this.checkBounds()
	//         //       const percentageDraggerMoved = scale(this.drag.x, boundsDragger.boundLeft, boundsDragger.boundRight, 1, 0)
	//         //       const boundsSlider = slider.checkBounds()

	//         //       slider.drag.x = scale(percentageDraggerMoved, 0, 1, boundsSlider.boundLeft, boundsSlider.boundRight)
	//         //       slider.translate.call(slider, true)
	//         //     }
	//         //   }
	//         //   onEnd () {
	//         //     super.onEnd.call(this)

	//         //     const boundsDragger = this.checkBounds()
	//         //     const percentageDraggerMoved = scale(this.drag.x, boundsDragger.boundLeft, boundsDragger.boundRight, 1, 0)
	//         //     const boundsSlider = slider.checkBounds()

	//         //     slider.drag.x = scale(percentageDraggerMoved, 0, 1, boundsSlider.boundLeft, boundsSlider.boundRight)
	//         //     slider.snap.call(slider)
	//         //   }
	//         // }

	//         // this.dotDraggerInstance = new dotDragger(barDragger, {
	//         //   lock: { y: true },
	//         //   overflowScrolling: false,
	//         //   wheel: false,
	//         // })

	//         // // process dragger
	//         // this.children.forEach((child, index) => {
	//         //   if (index <= this.children.length - slidesToShow) {
	//         //     const dot = document.createElement('div')
	//         //     dot.classList.add('slider__dots-item')
	//         //     dot.innerHTML = index + 1
	//         //     dot.addEventListener('click', () => this.goToIndex(index), false)
	//         //     if (index === this.currentIndex) dot.classList.add('slider__dots-item--current')

	//         //     this.containerDots.append(dot)
	//         //   }
	//         // })
	//       }
	//     }
	//   } else {
	//     if (this.containerDots) this.containerDots.parentNode.removeChild(this.containerDots)
	//   }
	// }
}

export default SliderDots;
