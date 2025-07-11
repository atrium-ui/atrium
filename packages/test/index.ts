import Rand from "rand-seed";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

const frameHooks = new Set<(ms: number) => void>();

setup();

// biome-ignore lint/suspicious/noConsole: testing
const log = console.log;
globalThis.console.log = (...args: any[]) => {
  log(
    (globalThis.currentFrame - globalThis.lastFrame).toFixed(2).padStart(6, "0"),
    globalThis.frameTime.toFixed(2).padStart(5, "0"),
    ...args,
  );
};
// biome-ignore lint/suspicious/noConsole: testing
globalThis.console.info = globalThis.console.log;

/**
 * Setup the test environment for a test-run.
 */
export function preload() {
  console.info("Init preload.");

  GlobalRegistrator.register();

  require("intersection-observer");
  globalThis.IntersectionObserver = window.IntersectionObserver;

  globalThis.seed = process.env.TEST_SEED || crypto.randomUUID();

  const tickTimes: number[] = [];

  let frameTimer: Timer;

  const avrgFrameTime = 16.6666666667; // 60 hz

  // @ts-ignore
  window.requestAnimationFrame = (callback: (ms: number) => void) => {
    const tickTime = avrgFrameTime / 2 + randomRaf() * (avrgFrameTime / 2);

    frameTimer = setTimeout(() => {
      globalThis.lastFrame = globalThis.currentFrame;
      globalThis.currentFrame = performance.now();

      tickTimes.push(tickTime);
      callback(Date.now());

      globalThis.frameTime = tickTime;
      for (const callback of frameHooks) callback(globalThis.currentFrame);
    }, tickTime);
    return frameTimer;
  };
  // @ts-ignore
  window.cancelAnimationFrame = (timer: Timer) => {
    clearTimeout(timer);
  };
}

// log each frame tick
// frameHooks.add((ms) => console.info(ms));

/**
 * Wait for a specified amount of time passed in frame loop.
 */
export function wait(time = 0) {
  const timestamp = performance.now();
  return new Promise<void>((resolve) => {
    const remove = onFrame((ms) => {
      if (ms - timestamp >= time) {
        resolve();
        remove();
      }
    });
  });
}

/**
 * Register a callback to be called on each frame.
 */
export function onFrame(callback: (ms: number) => void) {
  frameHooks.add(callback);
  return () => frameHooks.delete(callback);
}

/**
 * Setup the test environment for a single test.
 */
export function setup() {
  console.info("Setting up test environment.");

  frameHooks.clear();
  globalThis.firstFrame = performance.now();
  globalThis.lastFrame = globalThis.firstFrame;
  globalThis.currentFrame = globalThis.firstFrame;
  globalThis.frameTime = 0;
  globalThis.rand = new Rand(globalThis.seed);
  globalThis.rand_raf = new Rand(globalThis.seed);
}

/**
 * Generate a seeded random number.
 */
function randomRaf() {
  return globalThis.rand_raf.next();
}

/**
 * Generate a seeded random number.
 */
export function random() {
  return globalThis.rand.next();
}

/**
 * Returns a prefixed label for a test.
 */
export function label(str: string) {
  return `[TEST_SEED=${globalThis.seed} bun test track -t "${str}"]`;
}

export function press(ele: Element, key: string) {
  ele.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key,
    }),
  );
}

export async function fixElementSizes(ele: Element, width: number, height: number) {
  Object.defineProperty(ele, "offsetWidth", {
    writable: true,
  });
  Object.defineProperty(ele, "offsetHeight", {
    writable: true,
  });

  // @ts-ignore
  ele.offsetWidth = width;
  // @ts-ignore
  ele.offsetHeight = height;
}

export async function sleep(ms = 16) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pointer(type: string, x: number, y: number) {
  class FakePointerEvent extends PointerEvent {
    constructor(
      type: string,
      public x: number,
      public y: number,
      init?: PointerEventInit,
    ) {
      super(type, {
        button: 0,
        bubbles: true,
        cancelable: true,
        ...init,
      });
    }
  }

  return new FakePointerEvent(type, x, y);
}

export async function drag<
  T extends HTMLElement & {
    position: [number, number];
    target?: [number, number];
  },
>(ele: T, dist: [number, number]) {
  class FakePointerEvent extends PointerEvent {
    constructor(
      type: string,
      public x: number,
      public y: number,
      init?: PointerEventInit,
    ) {
      super(type, {
        button: 0,
        bubbles: true,
        cancelable: true,
        ...init,
      });
    }
  }

  const multiplier = 1 + random();
  const pos = [10, 10] as [number, number];
  const step = [
    Math.abs(dist[0]) > 0 ? multiplier * dist[0] : 0,
    Math.abs(dist[1]) > 0 ? multiplier * dist[1] : 0,
  ] as [number, number];

  // start moving
  console.info("drag start", multiplier, "dist", dist, "step", step);
  ele.dispatchEvent(new FakePointerEvent("pointerdown", ...pos));

  await sleep();

  for (let i = 0; i < 10; i++) {
    window.dispatchEvent(new FakePointerEvent("pointermove", ...pos));

    await sleep();

    pos[0] -= step[0];
    pos[1] -= step[1];
  }

  const upEvent = new FakePointerEvent("pointerup", ...pos);

  window.dispatchEvent(upEvent);
  console.info("drag end");

  await sleep();

  return upEvent;
}
