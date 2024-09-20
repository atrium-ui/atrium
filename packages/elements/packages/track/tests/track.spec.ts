import { test, expect } from "bun:test";
import type { MoveEvent } from "../src/Track";
import type { Track as TrackElement } from "../src/Track";

const NODE_NAME = "a-track";

test("import track element", async () => {
  const { Track } = await import("@sv/elements/track");
  expect(Track).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();
});

test("construct track element", async () => {
  const { Track } = await import("@sv/elements/track");

  // is constructable
  expect(new Track()).toBeInstanceOf(Track);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Track);
});

test("deconstruct track element", async () => {
  const track = await trackWithChildren();
  track.remove();
  // @ts-ignore
  expect(track.animation).toBeUndefined();
});

test("check default traits", async () => {
  const track = await trackWithChildren();
  expect(track.findTrait("pointer")).toBeDefined();
});

test("item count", async () => {
  const track = await trackWithChildren(10);
  expect(track.itemCount).toBe(10);
});

test("custom trait", async () => {
  const track = await trackWithChildren();

  let input = false;
  let update = false;
  let format = false;
  let start = false;
  let stop = false;

  track.addTrait({
    id: "test",

    input() {
      input = true;
    },

    update() {
      update = true;
    },

    stop() {
      stop = true;
    },

    start() {
      start = true;
    },

    format() {
      format = true;
    },
  });

  // @ts-ignore
  track.format();
  track.startAnimate();
  // @ts-ignore Force update tick
  track.updateTick();

  expect(start).toBeTrue();
  expect(input).toBeTrue();
  expect(update).toBeTrue();
  expect(format).toBeTrue();

  track.remove();

  expect(stop).toBeTrue();
});

test("check snap trait", async () => {
  const track = await trackWithChildren();
  track.snap = true;
  await track.updateComplete;
  expect(track.findTrait("snap")).toBeDefined();
});

test("arrow key navigation", async () => {
  const track = await trackWithChildren();
  track.tabIndex = 0;
  track.focus();

  press(track, "ArrowRight");

  await sleep(track.transitionTime);

  expect(document.activeElement).toBe(track);
  expect(track.currentItem).toBe(1);
});

test("move event details", async () => {
  const track = await trackWithChildren();
  track.addEventListener("move", ((e: MoveEvent) => {
    expect(e.detail.direction).toBeDefined();
    expect(e.detail.velocity).toBeDefined();
    expect(e.detail.position).toBeDefined();

    e.preventDefault();
  }) as EventListener);

  // @ts-ignore
  expect(track.canMove()).toBeFalse();
});

test("moveBy", async () => {
  const track = await trackWithChildren();

  track.moveBy(2);

  const positions: Array<number> = [];

  const int = setInterval(() => {
    positions.push(track.currentPosition);
  }, track.transitionTime / 10);

  await sleep(track.transitionTime);

  expect(track.currentItem).toBe(2);

  clearInterval(int);

  expect(positions.length > 5).toBeTrue();
});

test("centered", async () => {
  const track = await trackWithChildren(10, {
    align: "center",
  });

  expect(track.align).toBe("center");

  track.moveBy(0);
  await sleep(track.transitionTime);

  expect(track.currentItem).toBe(0);
  expect(track.currentPosition > 0).toBeTrue();
});

// TODO: test snap at specific position
// TODO:  +loop
//
// TODO: snap with inertia to the correct position

async function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fixElementSizes(ele: Element, width: number, height: number) {
  Object.defineProperty(ele, "offsetWidth", {
    writable: true,
  });
  Object.defineProperty(ele, "offsetHeight", {
    writable: true,
  });

  // @ts-ignore
  ele.offsetWidth = 800;
  // @ts-ignore
  ele.offsetHeight = 200;
}

async function trackWithChildren(
  itemCount = 10,
  attributes: Record<string, string> = {},
) {
  await import("@sv/elements/track");

  const div = document.createElement("div");
  const markup = `
    <a-track width="800" height="200" ${Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ")}>
      ${Array.from({ length: itemCount })
        .map(() => `<canvas width="200" height="200"></canvas>`)
        .join("")}
    </a-track>
  `;
  div.innerHTML = markup;

  const track = div.children[0] as TrackElement;
  fixElementSizes(track, 800, 200);

  for (let i = 0; i < itemCount; i++) {
    const child = track.children[i] as HTMLCanvasElement;
    fixElementSizes(child, child.width, child.height);
  }

  document.body.append(div);

  return track;
}

function press(ele: Element, key: string) {
  ele.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key,
    }),
  );
}
