import { test, expect } from "bun:test";
import { MoveEvent } from "../src/Track";

const NODE_NAME = "a-track";

async function trackWithChildren(itemCount = 10) {
  const { Track } = await import("@sv/elements/track");

  const track = new Track();
  track.style.width = "800px";
  track.style.height = "200px";
  for (let i = 0; i < itemCount; i++) {
    const child = document.createElement("canvas");
    child.width = 200;
    child.height = 200;
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
