import { afterEach, describe, expect, test } from "bun:test";
import { ScrollLock } from "../src/ScrollLock.js";

const enabledLocks: ScrollLock[] = [];

afterEach(() => {
  for (const lock of enabledLocks) lock.disable();
  enabledLocks.length = 0;
  document.body.innerHTML = "";
  document.body.style.cssText = "";
});

function enable(lock: ScrollLock) {
  enabledLocks.push(lock);
  lock.enable();
  return lock;
}

describe("ScrollLock", () => {
  test("locks and restores the existing body styles", () => {
    document.body.style.overflow = "scroll";
    document.body.style.scrollbarGutter = "auto";

    const lock = enable(new ScrollLock());
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.scrollbarGutter).toBe("stable");

    lock.disable();
    expect(document.body.style.overflow).toBe("scroll");
    expect(document.body.style.scrollbarGutter).toBe("auto");
  });

  test("keeps the page locked until the final nested lock closes", () => {
    const first = enable(new ScrollLock());
    const second = enable(new ScrollLock());

    first.disable();
    expect(document.body.style.overflow).toBe("hidden");

    second.disable();
    expect(document.body.style.overflow).toBe("");
  });

  test("prevents wheel scrolling outside allowed content", () => {
    const target = document.body.appendChild(document.createElement("div"));
    enable(new ScrollLock());
    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });

    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  test("allows an allowed element to scroll within its bounds", () => {
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "allowed";
    Object.defineProperties(target, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 300 },
    });
    target.scrollTop = 50;
    enable(new ScrollLock({ allowElements: [".allowed"] }));

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  test("prevents scroll chaining at an allowed element boundary", () => {
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "allowed";
    Object.defineProperties(target, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 300 },
    });
    target.scrollTop = 200;
    enable(new ScrollLock({ allowElements: [".allowed"] }));

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  test("allows an outer allowed scroller when an inner one reaches its boundary", () => {
    const outer = document.body.appendChild(document.createElement("div"));
    const inner = outer.appendChild(document.createElement("div"));
    outer.className = "allowed";
    inner.className = "allowed";
    Object.defineProperties(outer, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 300 },
    });
    Object.defineProperties(inner, {
      clientHeight: { value: 100 },
      scrollHeight: { value: 200 },
    });
    outer.scrollTop = 50;
    inner.scrollTop = 100;
    enable(new ScrollLock({ allowElements: [".allowed"] }));

    const event = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 10,
    });
    inner.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  test("updates additional allowed selectors without discarding defaults", () => {
    const lock = new ScrollLock({ allowElements: [".content"] });
    lock.setAdditionalAllowElements([".custom"]);

    expect(lock.options.allowElements).toEqual([
      "textarea",
      "iframe",
      ".content",
      ".custom",
    ]);
  });
});
