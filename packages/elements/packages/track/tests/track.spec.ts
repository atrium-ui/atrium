import { test, expect } from "bun:test";
import type { MoveEvent } from "../src/Track";

const NODE_NAME = "a-track";

async function trackWithChildren(itemCount = 10) {
  const { Track } = await import("@sv/elements/track");

  const track = new Track();
  track.style.width = "800px";
  track.style.height = "200px";

  Object.defineProperty(track, "offsetWidth", {
    writable: true,
  });
  Object.defineProperty(track, "offsetHeight", {
    writable: true,
  });

  track.offsetWidth = 800;
  track.offsetHeight = 200;

  for (let i = 0; i < itemCount; i++) {
    const child = document.createElement("canvas");
    child.width = 200;
    child.height = 200;

    Object.defineProperty(child, "offsetWidth", {
      writable: true,
    });
    Object.defineProperty(child, "offsetHeight", {
      writable: true,
    });

    child.offsetWidth = child.width;
    child.offsetHeight = child.height;

    track.append(child);
  }

  document.body.append(track);
  return track;
}

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

  track.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "ArrowRight",
    }),
  );

  expect(document.activeElement).toBe(track);

  // TODO: we dont have this info in test yet
  // console.log(track.currentItem);
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

test("offsetWidth", async () => {
  const track = await trackWithChildren();

  track.moveBy(2);

  const int = setInterval(() => {
    console.log(track.currentPosition);
  }, track.transitionTime / 10);

  await sleep(track.transitionTime + 100);

  console.log(track.currentItem);

  clearInterval(int);
});

// TODO: test snap at specific position
// TODO:  +loop
//
// TODO: snap with inertia to the correct position

async function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
