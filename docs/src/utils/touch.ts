/**
 * Touch Event Simulation Utilities
 * Simulates touch events using mouse events for desktop testing
 */

interface TouchPoint {
  identifier: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  target: Element;
}

interface TouchSimulationOptions {
  preventDefault?: boolean;
  bubbles?: boolean;
  cancelable?: boolean;
}

class TouchSimulator {
  private touchIdCounter = 0;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private isSimulating = false;

  /**
   * Enable touch simulation - converts mouse events to touch events
   */
  enable(element: Element = document.body): void {
    if (this.isSimulating) return;

    this.isSimulating = true;

    // Add mouse event listeners
    element.addEventListener("mousedown", this.handleMouseDown.bind(this), true);
    element.addEventListener("mousemove", this.handleMouseMove.bind(this), true);
    element.addEventListener("mouseup", this.handleMouseUp.bind(this), true);

    // Prevent default touch behavior if it exists
    element.addEventListener("touchstart", this.preventDefaultTouch, true);
    element.addEventListener("touchmove", this.preventDefaultTouch, true);
    element.addEventListener("touchend", this.preventDefaultTouch, true);
  }

  /**
   * Disable touch simulation
   */
  disable(element: Element = document.body): void {
    if (!this.isSimulating) return;

    this.isSimulating = false;

    // Remove mouse event listeners
    element.removeEventListener("mousedown", this.handleMouseDown.bind(this), true);
    element.removeEventListener("mousemove", this.handleMouseMove.bind(this), true);
    element.removeEventListener("mouseup", this.handleMouseUp.bind(this), true);

    // Remove touch event listeners
    element.removeEventListener("touchstart", this.preventDefaultTouch, true);
    element.removeEventListener("touchmove", this.preventDefaultTouch, true);
    element.removeEventListener("touchend", this.preventDefaultTouch, true);

    this.activeTouches.clear();
  }

  private handleMouseDown = (event: MouseEvent): void => {
    if (event.button !== 0) return; // Only handle left mouse button

    const touchPoint = this.createTouchPoint(event);
    this.activeTouches.set(touchPoint.identifier, touchPoint);

    this.dispatchTouchEvent("touchstart", event.target as Element, [touchPoint]);
    event.preventDefault();
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (this.activeTouches.size === 0) return;

    const touchPoint = Array.from(this.activeTouches.values())[0];
    const updatedTouchPoint = this.createTouchPoint(event, touchPoint.identifier);
    this.activeTouches.set(touchPoint.identifier, updatedTouchPoint);

    this.dispatchTouchEvent("touchmove", event.target as Element, [updatedTouchPoint]);
    event.preventDefault();
  };

  private handleMouseUp = (event: MouseEvent): void => {
    if (this.activeTouches.size === 0) return;

    const touchPoint = Array.from(this.activeTouches.values())[0];
    const updatedTouchPoint = this.createTouchPoint(event, touchPoint.identifier);

    this.dispatchTouchEvent("touchend", event.target as Element, [updatedTouchPoint]);
    this.activeTouches.delete(touchPoint.identifier);

    event.preventDefault();
  };

  private preventDefaultTouch = (event: TouchEvent): void => {
    event.preventDefault();
  };

  private createTouchPoint(event: MouseEvent, identifier?: number): TouchPoint {
    return {
      identifier: identifier ?? this.touchIdCounter++,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      screenX: event.screenX,
      screenY: event.screenY,
      target: event.target as Element,
    };
  }

  private dispatchTouchEvent(
    type: string,
    target: Element,
    touches: TouchPoint[],
    options: TouchSimulationOptions = {},
  ): void {
    const touchEvent = new CustomEvent(type, {
      bubbles: options.bubbles ?? true,
      cancelable: options.cancelable ?? true,
      detail: {
        touches: touches,
        targetTouches: touches.filter((touch) => touch.target === target),
        changedTouches: touches,
      },
    });

    // Add touch-specific properties
    Object.defineProperty(touchEvent, "touches", {
      value: this.createTouchList(Array.from(this.activeTouches.values())),
      enumerable: true,
    });

    Object.defineProperty(touchEvent, "targetTouches", {
      value: this.createTouchList(touches.filter((touch) => touch.target === target)),
      enumerable: true,
    });

    Object.defineProperty(touchEvent, "changedTouches", {
      value: this.createTouchList(touches),
      enumerable: true,
    });

    target.dispatchEvent(touchEvent);
  }

  private createTouchList(touches: TouchPoint[]): TouchList {
    const touchList = touches.map((touch) => ({
      identifier: touch.identifier,
      clientX: touch.clientX,
      clientY: touch.clientY,
      pageX: touch.pageX,
      pageY: touch.pageY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      target: touch.target,
    }));

    // Add TouchList methods
    Object.defineProperty(touchList, "length", {
      value: touches.length,
      enumerable: true,
    });

    Object.defineProperty(touchList, "item", {
      value: (index: number) => touchList[index] || null,
      enumerable: false,
    });

    return touchList as unknown as TouchList;
  }
}

// Utility functions for direct touch event simulation
export const touchSimulator = new TouchSimulator();

/**
 * Simulate a touch start event
 */
export function simulateTouchStart(
  element: Element,
  x: number,
  y: number,
  options: TouchSimulationOptions = {},
): void {
  const touch = createTouch(element, x, y, 0);
  dispatchTouchEvent("touchstart", element, [touch], options);
}

/**
 * Simulate a touch move event
 */
export function simulateTouchMove(
  element: Element,
  x: number,
  y: number,
  identifier = 0,
  options: TouchSimulationOptions = {},
): void {
  const touch = createTouch(element, x, y, identifier);
  dispatchTouchEvent("touchmove", element, [touch], options);
}

/**
 * Simulate a touch end event
 */
export function simulateTouchEnd(
  element: Element,
  x: number,
  y: number,
  identifier = 0,
  options: TouchSimulationOptions = {},
): void {
  const touch = createTouch(element, x, y, identifier);
  dispatchTouchEvent("touchend", element, [touch], options);
}

/**
 * Simulate a complete tap gesture
 */
export function simulateTap(
  element: Element,
  x: number,
  y: number,
  options: TouchSimulationOptions = {},
): void {
  simulateTouchStart(element, x, y, options);
  setTimeout(() => simulateTouchEnd(element, x, y, 0, options), 50);
}

/**
 * Simulate a swipe gesture
 */
export function simulateSwipe(
  element: Element,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration = 300,
  options: TouchSimulationOptions = {},
): void {
  const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY)) / 10;
  const stepX = (endX - startX) / steps;
  const stepY = (endY - startY) / steps;
  const stepDuration = duration / steps;

  simulateTouchStart(element, startX, startY, options);

  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const currentX = startX + stepX * i;
      const currentY = startY + stepY * i;

      if (i === steps) {
        simulateTouchEnd(element, currentX, currentY, 0, options);
      } else {
        simulateTouchMove(element, currentX, currentY, 0, options);
      }
    }, stepDuration * i);
  }
}

/**
 * Simulate a pinch gesture (two-finger zoom)
 */
export function simulatePinch(
  element: Element,
  centerX: number,
  centerY: number,
  startDistance: number,
  endDistance: number,
  duration = 500,
  options: TouchSimulationOptions = {},
): void {
  const steps = 20;
  const stepDuration = duration / steps;
  const distanceStep = (endDistance - startDistance) / steps;

  // Start with two touches
  const angle = Math.PI / 4; // 45 degrees

  for (let i = 0; i <= steps; i++) {
    const currentDistance = startDistance + distanceStep * i;
    const touch1X = centerX + (Math.cos(angle) * currentDistance) / 2;
    const touch1Y = centerY + (Math.sin(angle) * currentDistance) / 2;
    const touch2X = centerX - (Math.cos(angle) * currentDistance) / 2;
    const touch2Y = centerY - (Math.sin(angle) * currentDistance) / 2;

    setTimeout(() => {
      const touch1 = createTouch(element, touch1X, touch1Y, 0);
      const touch2 = createTouch(element, touch2X, touch2Y, 1);

      if (i === 0) {
        dispatchTouchEvent("touchstart", element, [touch1, touch2], options);
      } else if (i === steps) {
        dispatchTouchEvent("touchend", element, [touch1, touch2], options);
      } else {
        dispatchTouchEvent("touchmove", element, [touch1, touch2], options);
      }
    }, stepDuration * i);
  }
}

// Helper functions
function createTouch(
  element: Element,
  x: number,
  y: number,
  identifier: number,
): TouchPoint {
  const rect = element.getBoundingClientRect();
  const pageX = x + window.pageXOffset;
  const pageY = y + window.pageYOffset;
  const screenX = x + window.screenX;
  const screenY = y + window.screenY;

  return {
    identifier,
    clientX: x,
    clientY: y,
    pageX,
    pageY,
    screenX,
    screenY,
    target: element,
  };
}

function dispatchTouchEvent(
  type: string,
  target: Element,
  touches: TouchPoint[],
  options: TouchSimulationOptions = {},
): void {
  const touchEvent = new CustomEvent(type, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? true,
    detail: {
      touches: touches,
      targetTouches: touches.filter((touch) => touch.target === target),
      changedTouches: touches,
    },
  });

  // Add touch-specific properties
  Object.defineProperty(touchEvent, "touches", {
    value: createTouchList(touches),
    enumerable: true,
  });

  Object.defineProperty(touchEvent, "targetTouches", {
    value: createTouchList(touches.filter((touch) => touch.target === target)),
    enumerable: true,
  });

  Object.defineProperty(touchEvent, "changedTouches", {
    value: createTouchList(touches),
    enumerable: true,
  });

  target.dispatchEvent(touchEvent);
}

function createTouchList(touches: TouchPoint[]): TouchList {
  const touchList = touches.map((touch) => ({
    identifier: touch.identifier,
    clientX: touch.clientX,
    clientY: touch.clientY,
    pageX: touch.pageX,
    pageY: touch.pageY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    target: touch.target,
  }));

  // Add TouchList methods
  Object.defineProperty(touchList, "length", {
    value: touches.length,
    enumerable: true,
  });

  Object.defineProperty(touchList, "item", {
    value: (index: number) => touchList[index] || null,
    enumerable: false,
  });

  return touchList as unknown as TouchList;
}

// Usage examples and documentation
export default {
  /**
   * Enable automatic mouse-to-touch conversion
   */
  enableMouseToTouch: () => {
    touchSimulator.enable();
  },

  /**
   * Disable automatic mouse-to-touch conversion
   */
  disableMouseToTouch: () => {
    touchSimulator.disable();
  },

  /**
   * Simulate a tap on an element
   */
  simulateTapOnElement: (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      simulateTap(element, x, y);
    }
  },

  /**
   * Simulate a swipe gesture
   */
  simulateSwipeGesture: (
    selector: string,
    direction: "left" | "right" | "up" | "down",
  ) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = 100;

      let startX = centerX;
      let startY = centerY;
      let endX = centerX;
      let endY = centerY;

      switch (direction) {
        case "left":
          startX += distance / 2;
          endX -= distance / 2;
          break;
        case "right":
          startX -= distance / 2;
          endX += distance / 2;
          break;
        case "up":
          startY += distance / 2;
          endY -= distance / 2;
          break;
        case "down":
          startY -= distance / 2;
          endY += distance / 2;
          break;
      }

      simulateSwipe(element, startX, startY, endX, endY);
    }
  },
};
