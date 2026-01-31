const locks = new Set();

// ensure TouchEvent is defined
const TouchEvent = globalThis.TouchEvent || class {};

/**
 * # scroll-lock
 *
 * @example
 * ```js
 * import { ScrollLock } from '@sv/scroll-lock';
 * const scrollLock = new ScrollLock();
 *
 * // lock page scrolling
 * scrollLock.enable();
 * // unlock page scrolling
 * scrollLock.disable();
 * ```
 */
export class ScrollLock {
  enabled = false;

  private initialClientY = 0;
  private initialScrollX = 0;
  private initialScrollY = 0;

  private options = {
    allowElements: ["textarea", "iframe"],
  };

  private get rootElement() {
    return document.body;
  }

  constructor(options?: { allowElements?: string[] }) {
    if (options) {
      this.options = {
        allowElements: options.allowElements
          ? [...this.options.allowElements, ...options.allowElements]
          : this.options.allowElements,
      };
    }
  }

  private handleScrollStart = (event: TouchEvent) => {
    if (event.targetTouches && event.targetTouches.length === 1) {
      this.initialClientY = event.targetTouches[0]?.clientY || -1;
    }
  };

  private handleScroll = (event: Event, element?: Element) => {
    let deltaY = 0;

    if (event.type === "wheel") {
      // @ts-ignore
      deltaY = event.wheelDelta || event.deltaY * -1 || event.detail * -1;
    } else if (event.type === "touchmove") {
      // @ts-ignore
      deltaY = (this.initialClientY - event.targetTouches[0].clientY) * -1;
    }

    const direction = Math.sign(deltaY);

    if (
      event instanceof TouchEvent &&
      event.targetTouches &&
      event.targetTouches.length > 1
    ) {
      return this.handlePrevent(event);
    }

    if (element && element.scrollTop === 0 && direction < 0) {
      return this.handlePrevent(event);
    }

    if (
      element &&
      element.scrollHeight - element.scrollTop <= element.clientHeight &&
      direction > 0
    ) {
      return this.handlePrevent(event);
    }

    event.stopPropagation();

    return true;
  };

  private handlePrevent = (event: Event) => {
    if (this.enabled === false) {
      return true;
    }

    const element = event.target;

    // if target is allowed to scroll do so
    for (const allowElement of this.options.allowElements) {
      // @ts-ignore
      if (element.matches && event.target.matches(allowElement)) {
        return false;
      }
    }

    // prevent scroll on multi touch
    if (event instanceof TouchEvent && event.touches && event.touches.length > 1) {
      return true;
    }

    // magic mouse occurs scroll event even if window was leaving so scroll back to inital scroll position. it works but opera seams to be flickering sometimes.
    if (event.type === "scroll") {
      window.scrollTo(this.initialScrollX, this.initialScrollY);
    }

    // try to prevent default event
    if (event.preventDefault && event.cancelable) {
      event.preventDefault();
    }

    return false;
  };

  public enable() {
    if (this.enabled === true) return;

    this.initialScrollX = window.scrollX;
    this.initialScrollY = window.scrollY;

    window.addEventListener("scroll", this.handlePrevent, { passive: true });
    window.addEventListener("wheel", this.handlePrevent, { passive: true });
    document.addEventListener("touchmove", this.handlePrevent, { passive: true });

    for (const elementSelector of this.options.allowElements) {
      const eles = document.querySelectorAll(elementSelector);

      for (const elementNode of eles) {
        elementNode.addEventListener(
          "wheel",
          (event) => {
            this.handleScroll(event, elementNode);
          },
          { passive: true },
        );
        elementNode.addEventListener(
          "touchmove",
          (event) => {
            this.handleScroll(event, elementNode);
          },
          { passive: true },
        );
        // @ts-ignore
        elementNode.addEventListener("touchstart", this.handleScrollStart, {
          passive: true,
        });
      }
    }

    locks.add(this);
    this.enabled = true;

    this.rootElement.style.overflow = "hidden";
    this.rootElement.style.scrollbarGutter = "stable";
  }

  public disable() {
    if (this.enabled === false) return;

    window.removeEventListener("scroll", this.handlePrevent);
    window.removeEventListener("wheel", this.handlePrevent);
    document.removeEventListener("touchmove", this.handlePrevent);

    // biome-ignore lint/complexity/noForEach: <explanation>
    this.options.allowElements.forEach((elementSelector) => {
      [].forEach.call(
        document.querySelectorAll(elementSelector),
        (elementNode: HTMLElement) => {
          elementNode.removeEventListener("wheel", this.handleScroll);
          elementNode.removeEventListener("touchmove", this.handleScroll);
          elementNode.removeEventListener("touchstart", this.handleScrollStart);
        },
      );
    });

    locks.delete(this);
    this.enabled = false;

    if (locks.size === 0) {
      this.rootElement.style.overflow = "";
      this.rootElement.style.scrollbarGutter = "";
    }
  }
}
