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

  constructor(options?: {
    allowElements?: string[];
  }) {
    if (options) {
      this.options = {
        allowElements: options.allowElements
          ? [...this.options.allowElements, ...options.allowElements]
          : this.options.allowElements,
      };
    }
  }

  private getDirection(event) {
    let deltaY = 0;

    if (event.type === "wheel") {
      deltaY = event.wheelDelta || event.deltaY * -1 || event.detail * -1;
    } else if (event.type === "touchmove") {
      deltaY = (this.initialClientY - event.targetTouches[0].clientY) * -1;
    }

    return deltaY > 0 ? "up" : "down";
  }

  private handleScrollStart = (event) => {
    if (event.targetTouches && event.targetTouches.length === 1) {
      this.initialClientY = event.targetTouches[0].clientY;
    }
  };

  private handleScroll = (event: TouchEvent | WheelEvent, element?: HTMLElement) => {
    const direction = this.getDirection(event);

    if (
      event instanceof TouchEvent &&
      event.targetTouches &&
      event.targetTouches.length > 1
    ) {
      return this.handlePrevent(event);
    }

    if (element && element.scrollTop === 0 && direction === "up") {
      return this.handlePrevent(event);
    }

    if (
      element &&
      element.scrollHeight - element.scrollTop <= element.clientHeight &&
      direction === "down"
    ) {
      return this.handlePrevent(event);
    }

    event.stopPropagation();

    return true;
  };

  private handlePrevent = (event: Event) => {
    const element = event.target;

    if (this.enabled) {
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
    }

    return true;
  };

  public enable() {
    if (!this.enabled) {
      this.initialScrollX = window.scrollX;
      this.initialScrollY = window.scrollY;

      window.addEventListener("scroll", this.handlePrevent, { passive: true });
      window.addEventListener("wheel", this.handlePrevent, { passive: true });
      document.addEventListener("touchmove", this.handlePrevent, { passive: true });

      // biome-ignore lint/complexity/noForEach: <explanation>
      this.options.allowElements.forEach((elementSelector) => {
        [].forEach.call(
          document.querySelectorAll(elementSelector),
          (elementNode: HTMLElement) => {
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
            elementNode.addEventListener("touchstart", this.handleScrollStart, {
              passive: true,
            });
          },
        );
      });

      this.enabled = true;

      document.body.style.overflow = "clip";
      document.body.style.scrollbarGutter = "stable";
    }
  }

  public disable() {
    if (this.enabled) {
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

      this.enabled = false;

      document.body.style.overflow = "";
      document.body.style.scrollbarGutter = "";
    }
  }
}
