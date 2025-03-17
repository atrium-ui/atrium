import Rand from "rand-seed";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

const log = console.log;
globalThis.console.log = (...args: any[]) => {
  log((performance.now() - globalThis.firstFrame).toFixed(2), ...args);
};
globalThis.console.info = (...args: any[]) => {
  log((performance.now() - globalThis.firstFrame).toFixed(2), ...args);
};

/**
 * Setup the test environment for a test-run.
 */
export function enviroment() {
  globalThis.seed = process.env.TEST_SEED || crypto.randomUUID();

  require("intersection-observer");
  globalThis.IntersectionObserver = window.IntersectionObserver;

  const tickTimes = [];

  let timer: Timer;

  const avrgFrameTime = 16.6666666667; // 60 hz

  window.requestAnimationFrame = (callback: () => void) => {
    const tickTime = avrgFrameTime / 2 + randomRaf() * (avrgFrameTime / 2);
    timer = setTimeout(() => {
      tickTimes.push(tickTime);
      console.log(tickTime);
      callback(Date.now());
    }, tickTime);
    return timer;
  };
  window.cancelAnimationFrame = (timer: Timer) => {
    clearTimeout(timer);
  };
}

/**
 * Setup the test environment for a single test.
 */
export function setup() {
  globalThis.firstFrame = performance.now();
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

export class FakePointerEvent extends PointerEvent {
  constructor(
    type: string,
    public x: number,
    public y: number,
    init?: PointerEventInit,
  ) {
    super(type, {
      button: 0,
      bubbles: true,
      ...init,
    });
  }
}

export async function drag<
  T extends HTMLElement & {
    position: [number, number];
    target?: [number, number];
  },
>(ele: T, dist: [number, number]) {
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

  window.dispatchEvent(new FakePointerEvent("pointerup", ...pos));
  console.info("drag end");

  await sleep();
}
