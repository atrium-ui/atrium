/*
 *  @todo: firefox is blocking scroll area during overflow scrolling. is running because of non-passive eventlisteners and async scrolling.
 *  @todo: magic mouse seams to scroll even if the mouse is not hover the browser window
 *  @todo: maybe use https://github.com/d4nyll/lethargy to normalize scrollevent in different browsers with different input devices
 */

type ScrollLockOptions = {
  debug?: boolean;
  allowElements?: string[];
};

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
  private hasPassiveEvents = false;

  private options = {
    debug: false,
    allowElements: ["textarea", "iframe"],
  };

  constructor(options?: ScrollLockOptions) {
    if (options) {
      this.options = {
        debug: options.debug || false,
        allowElements: options.allowElements
          ? [...this.options.allowElements, ...options.allowElements]
          : this.options.allowElements,
      };
    }

    if (typeof window !== "undefined") {
      this.checkForPassiveEvents();
    }
  }

  private checkForPassiveEvents() {
    const passiveTestCallback = () => {};
    const passiveTestOptions = Object.defineProperty({}, "passive", {
      get: () => {
        this.hasPassiveEvents = true;
      },
    });

    window.addEventListener("testPassive", passiveTestCallback, passiveTestOptions);
    window.removeEventListener("testPassive", passiveTestCallback, passiveTestOptions);
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

  private handleScroll = (event, element) => {
    const e = event || window.event;
    const direction = this.getDirection(e);

    if (e.targetTouches && e.targetTouches.length > 1) {
      if (this.options.debug) {
        console.warn(
          "Scrolllock: prevent scrolling because it seems to be multi touch",
          e,
        );
      }

      return this.handlePrevent(e);
    }

    if (element && element.scrollTop === 0 && direction === "up") {
      if (this.options.debug) {
        console.warn("Scrolllock: prevent scrolling because scrollTop is reached", e);
      }

      return this.handlePrevent(e);
    }

    if (
      element &&
      element.scrollHeight - element.scrollTop <= element.clientHeight &&
      direction === "down"
    ) {
      if (this.options.debug) {
        console.warn("Scrolllock: prevent scrolling because scrollBottom is reached", e);
      }

      return this.handlePrevent(e);
    }

    e.stopPropagation();

    return true;
  };

  private handlePrevent = (event) => {
    const e = event || window.event;
    const element = e.target || e.srcElement;

    if (this.enabled) {
      // if target is allowed to scroll do so
      // biome-ignore lint/complexity/noForEach: <explanation>
      this.options.allowElements.forEach((allowElement) => {
        if (element.matches && e.target.matches(allowElement)) {
          return true;
        }
        return false;
      });

      // prevent scroll on multi touch
      if (e.touches && e.touches.length > 1) {
        return true;
      }

      // magic mouse occurs scroll event even if window was leaving so scroll back to inital scroll position. it works but opera seams to be flickering sometimes.
      if (e.type === "scroll") {
        window.scrollTo(this.initialScrollX, this.initialScrollY);
      }

      // try to prevent default event
      if (e.preventDefault && e.cancelable) {
        e.preventDefault();
      }

      e.returnValue = false;

      return false;
    }

    return true;
  };

  public enable() {
    if (!this.enabled) {
      this.initialScrollX = window.scrollX;
      this.initialScrollY = window.scrollY;

      window.addEventListener(
        "scroll",
        this.handlePrevent,
        this.hasPassiveEvents
          ? {
              passive: false,
            }
          : undefined,
      ); // useless?

      window.addEventListener(
        "wheel",
        this.handlePrevent,
        this.hasPassiveEvents
          ? {
              passive: false,
            }
          : undefined,
      );
      document.addEventListener(
        "touchmove",
        this.handlePrevent,
        this.hasPassiveEvents
          ? {
              passive: false,
            }
          : undefined,
      );

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
              this.hasPassiveEvents
                ? {
                    passive: false,
                  }
                : undefined,
            );
            elementNode.addEventListener(
              "touchmove",
              (event) => {
                this.handleScroll(event, elementNode);
              },
              this.hasPassiveEvents
                ? {
                    passive: false,
                  }
                : undefined,
            );

            elementNode.addEventListener(
              "touchstart",
              this.handleScrollStart,
              this.hasPassiveEvents
                ? {
                    passive: false,
                  }
                : undefined,
            );
          },
        );
      });

      this.enabled = true;
    }
  }

  public disable() {
    if (this.enabled) {
      window.removeEventListener("scroll", this.handlePrevent); // useless?

      window.removeEventListener("wheel", this.handlePrevent);
      document.removeEventListener("touchmove", this.handlePrevent);

      // biome-ignore lint/complexity/noForEach: <explanation>
      this.options.allowElements.forEach((elementSelector) => {
        [].forEach.call(
          document.querySelectorAll(elementSelector),
          (elementNode: HTMLElement) => {
            // @ts-ignore
            elementNode.removeEventListener("wheel", this.handleScroll); // doesn't do anything?
            // @ts-ignore
            elementNode.removeEventListener("touchmove", this.handleScroll); // doesn't do anything?

            elementNode.removeEventListener("touchstart", this.handleScrollStart);
          },
        );
      });

      this.enabled = false;
    }
  }
}
