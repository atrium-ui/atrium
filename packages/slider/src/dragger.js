import { gsap, Bounce, Expo } from 'gsap'

// import { debounce, merge } from 'lodash-es'
import * as _ from 'lodash-es'
import { resizeObserver } from './utils/utils.js'

const normalizeEvent = function (event) {
  if (event.changedTouches && event.changedTouches[0]) event.clientX = event.changedTouches[0].clientX
  if (event.changedTouches && event.changedTouches[0]) event.clientY = event.changedTouches[0].clientY
  
  return event
}

const createVelocityCalculator = function (event) {
  let x = normalizeEvent(event).clientX
  let y = normalizeEvent(event).clientY
  let t = Date.now()

  return function (e) {
    const newX = normalizeEvent(e).clientX
    const newY = normalizeEvent(e).clientY
    const newT = Date.now()
    const distX = newX - x
    const distY = newY - y
    const interval = newT - t || t

    x = newX
    y = newY
    t = newT

    return {
      distX: interval ? Math.sqrt(distX * distX) / (interval) : 0,
      distY: interval ? Math.sqrt(distY * distY) / (interval) : 0,
      directionX: Math.sign(distX),
      directionY: Math.sign(distY),
    }
  }
}

class Dragger {
  constructor (element, options, triggerCallback = true) {
    if (element) {
      this.element = element

      // states
      this.isInteracting = false

      this.start = { x: 0, y: 0 }
      this.drag = { x: 0, y: 0 }
      this.dist = { x: 0, y: 0 }
      this.target = { x: 0, y: 0 }
      this.point = { x: 0, y: 0 }

      this.isLockLeft = false
      this.isLockRight = false
      this.isLockBottom = false
      this.isLockTop = false
      this.isMoving = false
      this.isTranslating = false
      this.startime = 0
      this.timer = 0

      // store bounded event callbakcs
      this.boundedResizeFn = _.debounce(this.onResize.bind(this), 20)
      this.boundedStartFn = this.onStart.bind(this)
      this.boundedEndFn = this.onEnd.bind(this)
      this.boundedMoveFn = this.onMove.bind(this)
      this.boundedTouchmoveFn = this.onTouchmove.bind(this)
      this.boundedWheelFn = this.onWheel.bind(this)

      this.defaults = {
        alignX: 'inner', // 'inner' || 'outer'
        alignY: 'inner', // 'inner' || 'outer'
        bounds: {
          minX: options.rtl ? this.element.clientWidth - this.element.parentNode.clientWidth : 0,
          maxX: options.rtl ? 0 : -this.element.clientWidth + this.element.parentNode.clientWidth,
          minY: 0,
          maxY: -this.element.clientHeight + this.element.parentNode.clientHeight,
        },
        autoResize: true,
        container: this.element.parentNode,
        dragMultiplier: 1,
        friction: 1, // 0.85,
        lock: {
          x: false,
          y: false,
        },
        offsets: {
          left: 0, // this.element.parentNode.clientWidth / 2,
          right: 0, // this.element.parentNode.clientWidth / 2, // 10, // this.element.parentNode.clientWidth / 8,
          top: 0, // this.element.parentNode.clientHeight / 2,
          bottom: 0, // this.element.parentNode.clientHeight / 2,
        },
        overflowScrolling: true,
        overflowScrollingOffset: 50,
        // prevent (deltaX, deltaY) { return Math.abs(deltaX) > 0 && Math.abs(deltaX) > Math.abs(deltaY) },
        prevent () { return true },
        rtl: false, // options.rtl,
        wheel: true,
        velocityMultiplier: 200,

        // callbacks
        onInit () {},
        onStart () {},
        onMove () {},
        onEnd () {},
        onResize () {},
        onTranslate () {},
        onWheel () {},
        onComplete () {},
      }

      // options
      this.options = _.merge(this.defaults, options)

      // set dir attribute to support rtl
      if (this.options.rtl) this.options.container.parentNode.setAttribute('dir', 'rtl')

      // jump to start offset
      const bounds = this.checkBounds(this.options.offsets.left, this.options.offsets.top)
      this.drag.x = bounds.boundLeft
      this.drag.y = bounds.boundTop
      this.element.style.setProperty('transform', `translate3d(${this.drag.x}px, ${this.drag.y}px, 0)`)

      // set locks
      this.isLockLeft = !this.options.rtl
      this.isLockRight = this.options.rtl
      this.isLockTop = true
      this.isLockBottom = false

      this.bindEvents()

      // rrigger callback
      triggerCallback && this.options.onInit(this)

      return this
    } else {
      console.error('Dragger: No element given.')
    }
  }

  bindEvents () {
    this.destroy()
    
    if (this.options.autoResize) this.resizeObserver = new resizeObserver(this.boundedResizeFn, this.options.container)
    if (this.options.wheel) this.options.container.addEventListener('wheel', this.boundedWheelFn, false)

    this.element.addEventListener('touchstart', this.boundedStartFn, false)
    this.options.container.addEventListener('touchend', this.boundedEndFn, false)
    this.options.container.addEventListener('touchmove', this.boundedMoveFn, false)
    
    this.element.addEventListener('mousedown', this.boundedStartFn, false)
    this.options.container.addEventListener('mouseleave', this.boundedEndFn, false)
    this.options.container.addEventListener('mouseup', this.boundedEndFn, false)
    this.options.container.addEventListener('mousemove', this.boundedMoveFn, false)

    // can't use pointer events because scroll is triggered and animation canceled
    // this.element.addEventListener('pointerdown', this.boundedStartFn, false)
    // this.options.container.addEventListener('pointerup', this.boundedEndFn, false)
    // this.options.container.addEventListener('pointerleave', this.boundedEndFn, false)
    // this.options.container.addEventListener('pointermove', this.boundedMoveFn, false)
    // this.options.container.addEventListener('touchmove', this.boundedTouchmoveFn, { passive: true })
    // if (this.options.wheel) this.options.container.addEventListener('wheel', this.boundedWheelFn, { passive: true })
    // this.options.container.addEventListener('touchmove', this.boundedTouchmoveFn, false)
  }

  unbindEvents (withResize = false) {
    if (this.options.autoResize && this.resizeObserver && withResize) this.resizeObserver.destroyResizeObserver()
    if (this.options.wheel) this.options.container.removeEventListener('wheel', this.boundedWheelFn)

    this.element.removeEventListener('touchstart', this.boundedStartFn)
    this.options.container.removeEventListener('touchend', this.boundedEndFn)
    this.options.container.removeEventListener('touchmove', this.boundedMoveFn)

    this.element.removeEventListener('mousedown', this.boundedStartFn)
    this.options.container.removeEventListener('mouseleave', this.boundedEndFn)
    this.options.container.removeEventListener('mouseup', this.boundedEndFn)
    this.options.container.removeEventListener('mousemove', this.boundedMoveFn)

    // can't use pointer events because scroll is triggered and animation canceled
    // this.element.removeEventListener('pointerdown', this.boundedStartFn)
    // this.options.container.removeEventListener('pointerup', this.boundedEndFn)
    // this.options.container.removeEventListener('pointerleave', this.boundedEndFn)
    // this.options.container.removeEventListener('pointermove', this.boundedMoveFn)
    // this.options.container.removeEventListener('touchmove', this.boundedTouchmoveFn)
  }

  destroy () {
    this.unbindEvents(true)

    if(this.resizeObserver) this.resizeObserver.destroyResizeObserver()
  }

  checkBounds (x = this.drag.x, y = this.drag.y) {
    const offsetDistanceX = this.options.container.clientWidth - this.options.offsets.left - this.options.offsets.right
    const offsetDistanceY = this.options.container.clientHeight - this.options.offsets.top - this.options.offsets.bottom
    const isOverlappingOffsetX = this.options.offsets.left > this.options.container.clientWidth - this.options.offsets.right
    const isOverlappingOffsetY = this.options.offsets.top > this.options.container.clientHeight - this.options.offsets.bottom
    const isSmallerThenDistanceX = Math.abs(offsetDistanceX) < this.element.clientWidth
    const isSmallerThenDistanceY = Math.abs(offsetDistanceY) < this.element.clientHeight

    // calc offsets
    const offsetX = this.options.alignX === 'outer' ? this.element.clientWidth : isSmallerThenDistanceX ? offsetDistanceX > 0 ? this.element.clientWidth - offsetDistanceX : offsetDistanceX + this.element.clientWidth : 0
    const offsetY = this.options.alignY === 'outer' ? this.element.clientHeight : isSmallerThenDistanceY ? offsetDistanceY > 0 ? this.element.clientHeight - offsetDistanceY : offsetDistanceY + this.element.clientHeight : 0

    // calc bounds with offsets
    const boundLeft = isOverlappingOffsetX ? this.options.bounds.minX + (this.options.container.clientWidth - this.options.offsets.right) - offsetX : this.options.bounds.minX + (this.options.rtl ? this.options.offsets.right : this.options.offsets.left) - offsetX
    const boundRight = isOverlappingOffsetX ? this.options.bounds.maxX - (this.options.container.clientWidth - this.options.offsets.left) + offsetX : this.options.bounds.maxX - (this.options.rtl ? this.options.offsets.left : this.options.offsets.right) + offsetX
    const boundTop = isOverlappingOffsetY ? this.options.bounds.minY + (this.options.container.clientHeight - this.options.offsets.bottom) - offsetY : this.options.bounds.minY + this.options.offsets.top - offsetY
    const boundBottom = isOverlappingOffsetY ? this.options.bounds.maxY - (this.options.container.clientHeight - this.options.offsets.top) + offsetY : this.options.bounds.maxY - this.options.offsets.bottom + offsetY

    let xDiff = 0, yDiff = 0, xBound = 0, yBound = 0 // eslint-disable-line

    if (this.options.bounds.minX !== undefined && x < boundLeft) {
      xDiff = parseInt(boundLeft - x)
    } else if (this.options.bounds.maxX !== undefined && x > boundRight) {
      xDiff = parseInt(boundRight - x)
    }

    if (this.options.bounds.minY !== undefined && y < boundTop) {
      yDiff = parseInt(boundTop - y)
    } else if (this.options.bounds.maxY !== undefined && y > boundBottom) {
      yDiff = parseInt(boundBottom - y)
    }

    // set bounds
    if (xDiff !== 0) xBound = xDiff > 0 ? boundLeft : boundRight
    if (yDiff !== 0) yBound = yDiff > 0 ? boundTop : boundBottom

    return {
      inBounds: xDiff === 0 && yDiff === 0,
      x: xDiff !== 0 ? xBound : x,
      y: yDiff !== 0 ? yBound : y,

      lockLeft: xDiff !== 0 && xDiff < 0 || x === boundRight,
      lockRight: xDiff !== 0 && xDiff > 0 || x === boundLeft,
      lockTop: yDiff !== 0 && yDiff < 0 || y === boundBottom,
      lockBottom: yDiff !== 0 && yDiff > 0 || y === boundTop,

      // eslint-disable-next-line object-property-newline
      xDiff, yDiff, boundLeft, boundRight, boundTop, boundBottom,
    }
  }

  getTranslateXY (element) {
    const style = window.getComputedStyle(element)
    const matrix = new window.DOMMatrixReadOnly(style.transform)
    
    return {
      translateX: matrix.m41,
      translateY: matrix.m42
    }
  }

  onComplete (triggerCallback = true) {
    if (!this.isInteracting) {
      this.isTranslating = false

      triggerCallback && this.options.onComplete(this.drag.x, this.drag.y, this.element)
    }
  }

  onStart (event, triggerCallback = true) {
    this.isInteracting = true

    if (this.tween) {
      gsap.killTweensOf(this.element)
      this.tween = null
    }

    this.velocity = null
    this.dist.x = null
    this.dist.y = null

    this.startime = Date.now()
    this.point.x = normalizeEvent(event).clientX
    this.point.y = normalizeEvent(event).clientY

    const currentPosition = this.getCurrentPositon()
    this.start.x = currentPosition.x + (this.options.rtl ? 0 : this.element.offsetLeft) // this.drag.x
    this.start.y = currentPosition.y + (this.options.rtl ? 0 : this.element.offsetTop) // this.drag.y

    this.isMoving = false // TODO needed? why not true?

    // trigger callback
    triggerCallback && this.options.onStart(event, this)
  }

  onEnd (event, triggerCallback = true) { // eslint-disable-line
    if (this.isInteracting) {
      const velocityX = (this.velocity ? (this.velocity.distX * this.velocity.directionX) : 0)
      const velocityY = (this.velocity ? (this.velocity.distY * this.velocity.directionY) : 0)
      const acceleratedX = this.drag.x + velocityX
      const acceleratedY = this.drag.y + velocityY
      const bound = this.checkBounds(acceleratedX, acceleratedY)

      if (!this.options.lock.x) this.drag.x = bound.x
      if (!this.options.lock.y) this.drag.y = bound.y

      // const bound = this.checkBounds(this.drag.x, this.drag.y)
      // const overflowScrollingOffset = this.options.overflowScrolling ? this.options.overflowScrollingOffset : 0
      // if (!this.options.lock.x) this.drag.x = Math.max(Math.min(this.drag.x, bound.boundRight + overflowScrollingOffset), bound.boundLeft - overflowScrollingOffset) // * (-2 + (this.dist.x / this.options.container.clientWidth))
      // if (!this.options.lock.y) this.drag.y = Math.max(Math.min(this.drag.y, bound.boundBottom + overflowScrollingOffset), bound.boundTop - overflowScrollingOffset) // * (1 + (this.dist.y / this.options.container.clientHeight))

      this.isInteracting = false

      this.translate()

      // prevent click event from bubbling
      setTimeout(() => {
        this.isMoving = false

        // trigger callback
        triggerCallback && this.options.onEnd(event, this)
      }, 200)
    }
  }

  onMove (event, triggerCallback = true) {
    event.deltaX = normalizeEvent(event).clientX - this.point.x // !this.options.lock.x ? event.changedTouches[0].clientX - this.point.x : 0
    event.deltaY = normalizeEvent(event).clientY - this.point.y // !this.options.lock.y ? event.changedTouches[0].clientY - this.point.y : 0

    if (this.options.prevent(event) || Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 0 && Math.abs(event.deltaY) < 10) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (this.isInteracting) {

      if (this.tween) {
        gsap.killTweensOf(this.element)
        this.tween = null
      }

      if (this.velocityCalculator) {
        this.velocity = this.velocityCalculator(event)
        this.velocity.distX *= this.options.velocityMultiplier
        this.velocity.distY *= this.options.velocityMultiplier
      }

      this.velocityCalculator = createVelocityCalculator(event)
      
      this.isMoving = true

      if (!this.options.lock.x) this.dist.x = normalizeEvent(event).clientX - this.point.x
      if (!this.options.lock.y) this.dist.y = normalizeEvent(event).clientY - this.point.y

      const bound = this.checkBounds()
      
      // TODO: apply acceleration or dampling if bounds are reached
      // if ((this.isLockLeft && this.dist.x > 0) || (this.isLockRight && this.dist.x < 0)) { this.dist.x /= 10 } else { this.dist.x *= this.options.dragMultiplier }
      // if ((this.isLockTop && this.dist.y > 0) || (this.isLockBottom && this.dist.y < 0)) { this.dist.y /= 10 } else { this.dist.y *= this.options.dragMultiplier }
      // if ((this.drag.x >= bound.boundRight) || (this.drag.x <= bound.boundLeft)) { this.dist.x /= 10 } else { this.dist.x *= this.options.dragMultiplier }
      // if ((this.drag.y >= bound.boundBottom) || (this.drag.y <= bound.boundTop)) { this.dist.y /= 10 } else { this.dist.y *= this.options.dragMultiplier }
      this.dist.x *= this.options.dragMultiplier
      this.dist.y *= this.options.dragMultiplier

      // restrict overflow scrolling
      const overflowScrollingOffset = this.options.overflowScrolling ? this.options.overflowScrollingOffset : 0
      if (!this.options.lock.x) this.drag.x = Math.max(Math.min(this.start.x + this.dist.x, bound.boundRight + overflowScrollingOffset), bound.boundLeft - overflowScrollingOffset) // * (-2 + (this.dist.x / this.options.container.clientWidth))
      if (!this.options.lock.y) this.drag.y = Math.max(Math.min(this.start.y + this.dist.y, bound.boundBottom + overflowScrollingOffset), bound.boundTop - overflowScrollingOffset) // * (1 + (this.dist.y / this.options.container.clientHeight))

      this.translate(0)

      // trigger callback
      triggerCallback && this.options.onMove(event, this)
    }
  }

  onWheel (event, triggerCallback = true) {
    if (this.options.prevent(event) || Math.abs(event.deltaX) > 0 && Math.abs(event.deltaY) < 20) {
      event.preventDefault()

      // this.isMoving = true
      this.velocity = null
      this.dist.x = event.deltaX * 1.35
      this.dist.y = event.deltaY * 1.35

      const bound = this.checkBounds(this.drag.x + this.dist.x, this.drag.y + this.dist.y)
      if (!this.options.lock.x) this.drag.x = bound.x
      if (!this.options.lock.y) this.drag.y = bound.y

      // this.element.style.setProperty('transform', `translate3d(${this.drag.x}px, ${this.drag.y}px, 0)`)
      this.translate(0.5)

      // trigger callback
      triggerCallback && this.options.onWheel(event, this)
    }
  }

  onTouchmove (event) { // deprecated
    event.deltaX = event.changedTouches[0].clientX - this.point.x // !this.options.lock.x ? event.changedTouches[0].clientX - this.point.x : 0
    event.deltaY = event.changedTouches[0].clientY - this.point.y // !this.options.lock.y ? event.changedTouches[0].clientY - this.point.y : 0

    if (this.options.prevent(event)) {
      event.preventDefault()
      event.stopPropagation()
      // event.stopImmediatePropagation()
    }
  }

  onResize (event, triggerCallback = true) {
    this.updateBounds()
    // this.updateOffsets()

    // trigger callback
    triggerCallback && this.options.onResize(event, this)
  }

  translate (duration = 1.25, triggerCallback = true) {
    this.isTranslating = true

    // if (this.tween) {
    //   gsap.killTweensOf(this.element)
    //   this.tween = null
    // }

    const time = Date.now() - this.startime
    const speedX = (Math.abs(this.velocity ? this.velocity.distX : 0) / time)
    const durationX = speedX / this.options.friction / 1000
    const speedY = (Math.abs(this.velocity ? this.velocity.distY : 0) / time)
    const durationY = speedY / this.options.friction / 1000

    const bounds = this.checkBounds(this.drag.x, this.drag.y)
    const toX = this.isInteracting ? this.drag.x : bounds.x
    const toY = this.isInteracting ? this.drag.y : bounds.y
    const isOverflow = this.drag.x < bounds.boundLeft || this.drag.x > bounds.boundRight
    // console.log('isOverflow', isOverflow)

    // occurs flicker during move
    // this.isLockLeft = bounds.lockLeft
    // this.isLockRight = bounds.lockRight
    // this.isLockTop = bounds.lockTop
    // this.isLockBottom = bounds.lockBottom

    const translateXY = this.getTranslateXY(this.element)
    const needsUpdate = translateXY.translateX !== toX || translateXY.translateY !== toY

    if (needsUpdate) {
      this.tween = gsap.to(this.element, {
        duration: Math.max(durationX, durationY) + duration,
        x: toX,
        y: toY,
        force3D: true,
        ease: Expo.easeOut, // isOverflow ? Bounce.easeOut : Expo.easeOut,
        onUpdate: this.onTranslate.bind(this),
        onComplete: this.onComplete.bind(this),
      })
    }
  }

  onTranslate (triggerCallback = true) {
    triggerCallback && this.options.onTranslate(this.drag.x, this.drag.y, this)
  }

  getCurrentPositon () {
    const currentPosition = new DOMMatrix(this.element.style.transform) // new WebKitCSSMatrix(window.getComputedStyle(this.element).transform);

    return {
      x: currentPosition.m41,
      y: currentPosition.m42,
    }
  }

  updateBounds () {
    this.options = _.merge(this.options, {
      bounds: {
        minX: this.options.rtl ? this.element.clientWidth - this.options.container.clientWidth : 0,
        maxX: this.options.rtl ? 0 : -this.element.clientWidth + this.options.container.clientWidth,
        minY: 0,
        maxY: -this.element.clientHeight + this.options.container.clientHeight,
      }
    })
  }

  updateOffsets (offsets = {}) {
    this.options = _.merge(this.options, { offsets })
  }

  updateOptions (options) {
    this.options = _.merge(this.options, options)
  }
}

export default Dragger
