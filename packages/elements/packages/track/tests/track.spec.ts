import { test, expect } from "bun:test";

const NODE_NAME = "a-track";

async function trackWithChildren() {
  const { Track } = await import("@sv/elements/track");

  const track = new Track();
  track.style.width = "800px";
  track.style.height = "200px";
  for (let i = 0; i < 10; i++) {
    const div = document.createElement("div");
    div.style.flex = "none";
    div.style.height = "200px";
    div.style.height = "200px";
    track.append(div);
  }

  // TODO: IntersectionObserver not defined
  // TODO  event.eventPhase = EventPhaseEnum.atTarget; TypeError: Attempted to assign to readonly property.
  // document.body.append(track);

  return track;
}

test("import track element", async () => {
  const { Track } = await import("@sv/elements/track");
  expect(Track).toBeDefined();

  // is defined in custom element registry
  expect(customElements.get(NODE_NAME)).toBeDefined();

  // is constructable
  expect(new Track()).toBeInstanceOf(Track);

  const html = `<${NODE_NAME} />`;
  const ele = document.createElement("div");
  ele.innerHTML = html;

  expect(ele.children[0]).toBeInstanceOf(Track);
});

test("check default traits", async () => {
  const track = await trackWithChildren();
  expect(track.findTrait("pointer")).toBeDefined();
});

test("check snap trait", async () => {
  const track = await trackWithChildren();
  track.snap = true;
  // @ts-ignore: simulate update
  track.updated();

  expect(track.findTrait("snap")).toBeDefined();
});

// TODO: *see above*
// test("tab navigation", async () => {
//   const track = await trackWithChildren();
//   track.children[8]?.focus();
//   track.updated();

//   console.log(track.position);
// });
