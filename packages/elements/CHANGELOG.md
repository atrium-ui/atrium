# @sv/elements

## 1.1.0 (2024-05-27)

### Features

- added experimental portal gun 🌀

## 1.0.0 (2024-05-26)

- added form elements

## 0.11.7 (2024-05-22)

### Features

- a-blur: force pointer events when enabled

## 0.11.6 (2024-05-22)

### Features

- a-track: set touch-action according to mode
- a-track: improve perf by leaning on native scrolling more
- a-animation: load wasm async

### Fixes

- a-adaptive: fix width and height calculations

## 0.11.5 (2024-05-14)

### Features

- a-animation: load wasm async

## 0.11.4 (2024-05-09)

### Fixes

- a-adaptive: fix width and height calculations

## 0.11.3 (2024-05-07)

### Features

- a-track: improve perf by leaning on native scrolling more

## 0.11.2 (2024-05-02)

### Features

- a-track: set touch-action according to mode

## 0.11.1 (2024-04-28)

### Features

- a-track add delta to move event detail

## 0.11.0 (2024-04-24)

### Breaking Changes

- update to lit v3.1.3

## 0.10.7 (2024-04-24)

### Features

- update to lit v3.1.3

## 0.10.6 (2024-04-20)

### Features

- a-track: add details to move event
- a-animation: added layout prop and docuemntation

## 0.10.5 (2024-04-18)

### Features

- a-track: grab focus when clicked on
- a-track: move on focus only when item is out of view

### Fixes

- correctly prevent click events while dragging
- a-track: stop track on pointer down

## 0.10.4 (2024-04-14)

### Features

- Implemented focus management to a-blur

## 0.10.3 (2024-04-13)

### Fixes

- fix release

## 0.10.2 (2024-04-13)

### Fixes

- correctly debounce resize events

## 0.10.1 (2024-04-13)

### Fixes

- fix bug where a-track would prevent text selection on page
- better configure behaviour of format changes

## 0.10.0

### Minor Changes

- 91ce937: a-track: refactor interface

## 0.9.2

### Patch Changes

- 9268acf: a-track: handle focus events inside children

## 0.9.1

### Patch Changes

- 1d07dc1: a-track: improve ux of snap

## 0.9.0

### Minor Changes

- 1300f04: a-popover: automatically determine direction of popover

## 0.8.3

### Patch Changes

- ed1d4bc: track: correctly prevent events with nested tracks
- ed1d4bc: track: update caches when child dimensions change
- ed1d4bc: track: prevent snapping when end is reached

## 0.8.2

### Patch Changes

- e169da2: track: fix snap trait not working

## 0.8.1

### Patch Changes

- da0612d: Make transition time configurable

## 0.8.0

### Minor Changes

- 0ae2eee: Track refactoring and fixes

## 0.7.1

### Patch Changes

- ceffb74: emit custom scroll events on a-track

## 0.7.0

### Minor Changes

- c61e875: Minor refactor of track element

## 0.6.0

### Minor Changes

- 0283038: a-track refactor

## 0.5.0

### Minor Changes

- cd71005: Refactor a-track to expose traits

## 0.4.0

### Minor Changes

- 24c1395: Refactor a-track to expose traits

## 0.3.1

### Patch Changes

- 608123d: Allow scrolling inside scroll-locked a-blur

## 0.3.0

### Minor Changes

- 6edf11d: Added adaptive element, disregard blur on mousedown instead of click
