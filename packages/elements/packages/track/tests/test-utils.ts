import Rand from "rand-seed";
import { expect } from "bun:test";
import type { Vec2 } from "../src";
import type { Track as TrackElement } from "../src/Track";

export function enviroment() {
  globalThis.seed = process.env.TEST_SEED || crypto.randomUUID();
}

export function setup() {
  globalThis.rand = new Rand(globalThis.seed);
}

export function random() {
  return globalThis.rand.next();
}

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
    position: Vec2;
    target?: Vec2;
  },
>(track: T, dist: [number, number]) {
  const multiplier = 1 + random();
  const pos = [10, 10] as [number, number];
  const start = [...track.position];
  const step = [
    Math.abs(dist[0]) > 0 ? multiplier * dist[0] : 0,
    Math.abs(dist[1]) > 0 ? multiplier * dist[1] : 0,
  ] as [number, number];

  console.info("drag", multiplier, "dist", dist, "step", step, "start", start);

  // start moving
  track.dispatchEvent(new FakePointerEvent("pointerdown", ...pos));
  console.info("down");

  await sleep();

  expect(track.target).toBeUndefined();

  for (let i = 0; i < 10; i++) {
    window.dispatchEvent(new FakePointerEvent("pointermove", ...pos));

    await sleep();

    pos[0] -= step[0];
    pos[1] -= step[1];
  }
  // has moved at all?
  expect(track.position[0] !== start[0] || track.position[1] !== start[1]).toBeTrue();

  window.dispatchEvent(new FakePointerEvent("pointerup", ...pos));
  console.info("up");

  await sleep();
}

export async function trackWithChildren(
  itemCount = 10,
  attributes: Record<string, string | boolean | number> = {},
) {
  await import("../src/index.js");

  const widths = new Array<number>(itemCount)
    .fill(0)
    .map(() => Math.floor(random() * 500 + 150));

  console.info("items", widths);

  const div = document.createElement("div");
  const markup = `
    <a-track ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>
      ${widths.map((w) => `<canvas width="${w}" height="800"></canvas>`).join("")}
    </a-track>
  `;
  div.innerHTML = markup;

  const track = div.children[0] as TrackElement;
  fixElementSizes(track, random() * 1000 + 200, random() * 800 + 200);

  // increase animation speed for testing
  track.transitionTime = 100;

  for (let i = 0; i < itemCount; i++) {
    const child = track.children[i] as HTMLCanvasElement;
    fixElementSizes(
      child,
      Number.parseInt(child.getAttribute("width") || "0"),
      Number.parseInt(child.getAttribute("height") || "0"),
    );
  }

  document.body.append(div);

  if (track.vertical) {
    track.position.y = random() * track.overflowWidth;
  } else {
    track.position.x = random() * track.overflowWidth;
  }

  console.info("track", track.width, track.height, track.trackWidth, track.position);

  // @ts-ignore
  track.onFormat();

  return track;
}
