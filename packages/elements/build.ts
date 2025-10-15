/// <reference types="@types/bun" />

await Promise.all([
  //
  import("./packages/animation/build.js"),
  import("./packages/blur/build.js"),
  import("./packages/box/build.js"),
  import("./packages/chart/build.js"),
  import("./packages/expandable/build.js"),
  import("./packages/form/build.js"),
  import("./packages/list/build.js"),
  import("./packages/loader/build.js"),
  import("./packages/popover/build.js"),
  import("./packages/portal/build.js"),
  import("./packages/range/build.js"),
  import("./packages/scroll/build.js"),
  import("./packages/select/build.js"),
  import("./packages/shortcut/build.js"),
  import("./packages/time/build.js"),
  import("./packages/toast/build.js"),
  import("./packages/toggle/build.js"),
  import("./packages/track/build.js"),
  import("./packages/transition/build.js"),
]);

export {};
