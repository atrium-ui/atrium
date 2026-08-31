type ScrollLockOptions = {
  allowElements?: string[];
};

const DEFAULT_ALLOW_ELEMENTS = ["textarea", "iframe"];
const locks = new Set<ScrollLock>();

let initialBodyOverflow = "";
let initialBodyScrollbarGutter = "";
let initialScrollX = 0;
let initialScrollY = 0;
let initialTouchY: number | undefined;

function activeLock() {
  return Array.from(locks).at(-1);
}

function matchesSelector(element: Element, selector: string) {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

function eventElements(event: Event) {
  return event
    .composedPath()
    .filter((target): target is Element => target instanceof Element);
}

function canAllowedElementScroll(event: Event, selectors: string[], deltaY: number) {
  for (const element of eventElements(event)) {
    if (!selectors.some((selector) => matchesSelector(element, selector))) continue;

    if (
      element instanceof HTMLElement &&
      element.scrollHeight > element.clientHeight &&
      canScroll(element, deltaY)
    ) {
      return true;
    }
  }

  return false;
}

function canScroll(element: HTMLElement, deltaY: number) {
  if (deltaY < 0) return element.scrollTop > 0;
  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight;
  }
  return true;
}

function preventPageScroll(event: Event, deltaY: number) {
  const lock = activeLock();
  if (!lock) return;

  if (canAllowedElementScroll(event, lock.options.allowElements, deltaY)) return;

  if (event.cancelable) event.preventDefault();
}

function onWheel(event: WheelEvent) {
  preventPageScroll(event, event.deltaY);
}

function onTouchStart(event: TouchEvent) {
  initialTouchY = event.touches.length === 1 ? event.touches[0]?.clientY : undefined;
}

function onTouchMove(event: TouchEvent) {
  if (event.touches.length !== 1 || initialTouchY === undefined) {
    preventPageScroll(event, 1);
    return;
  }

  const currentY = event.touches[0]?.clientY ?? initialTouchY;
  preventPageScroll(event, initialTouchY - currentY);
  initialTouchY = currentY;
}

function onWindowScroll() {
  if (locks.size > 0) window.scrollTo(initialScrollX, initialScrollY);
}

function startGlobalLock() {
  const body = document.body;
  initialBodyOverflow = body.style.overflow;
  initialBodyScrollbarGutter = body.style.scrollbarGutter;
  initialScrollX = window.scrollX;
  initialScrollY = window.scrollY;

  body.style.overflow = "hidden";
  body.style.scrollbarGutter = "stable";

  window.addEventListener("scroll", onWindowScroll, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  document.addEventListener("touchstart", onTouchStart, {
    passive: true,
    capture: true,
  });
  document.addEventListener("touchmove", onTouchMove, {
    passive: false,
    capture: true,
  });
}

function stopGlobalLock() {
  window.removeEventListener("scroll", onWindowScroll);
  window.removeEventListener("wheel", onWheel, { capture: true });
  document.removeEventListener("touchstart", onTouchStart, { capture: true });
  document.removeEventListener("touchmove", onTouchMove, { capture: true });

  document.body.style.overflow = initialBodyOverflow;
  document.body.style.scrollbarGutter = initialBodyScrollbarGutter;
  initialTouchY = undefined;
}

/** Page scroll locking used by modal Atrium elements. */
export class ScrollLock {
  public enabled = false;
  public options: { allowElements: string[] };
  private readonly configuredAllowElements: string[];

  public constructor(options: ScrollLockOptions = {}) {
    this.configuredAllowElements = options.allowElements ?? [];
    this.options = {
      allowElements: [...DEFAULT_ALLOW_ELEMENTS, ...this.configuredAllowElements],
    };
  }

  /** Add selectors that may change between openings, such as an element attribute. */
  public setAdditionalAllowElements(selectors: string[]) {
    this.options.allowElements = [
      ...DEFAULT_ALLOW_ELEMENTS,
      ...this.configuredAllowElements,
      ...selectors,
    ];
  }

  public enable() {
    if (this.enabled) return;
    if (locks.size === 0) startGlobalLock();

    locks.add(this);
    this.enabled = true;
  }

  public disable() {
    if (!this.enabled) return;

    locks.delete(this);
    this.enabled = false;
    if (locks.size === 0) stopGlobalLock();
  }
}
