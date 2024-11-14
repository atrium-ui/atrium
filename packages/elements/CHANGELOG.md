# @sv/elements

## 1.17.0 (2024-11-14)

### Features

- Update rive for text and layout support (svp/atrium!21)

### Fixes

- Make accordion content inert if closed

## 1.16.0 (2024-10-15)

### Features

- a-expandable: add css part to expandable container
- add option to add arrow to popover

## 1.16.0-dev.0 (2024-09-24)

### Features

- a-expandable: add css part to expandable container

## 1.15.0 (2024-09-23)

### Features

- a-track: added centered attribute and handling

### Fixes

- a-track: uses wrong item to center itself
- a-track: first element not cetnered correctly when align=center

## 1.15.0-dev.2 (2024-09-20)

### Features

- a-track: added centered attribute and handling

### Fixes

- a-track: uses wrong item to center itself
- a-track: first element not cetnered correctly when align=center

## 1.15.0-dev.1 (2024-09-20)

### Features

- a-track: added centered attribute and handling

### Fixes

- a-track: uses wrong item to center itself

## 1.15.0-dev.0 (2024-09-19)

### Features

- a-track: added centered attribute and handling

## 1.14.4 (2024-09-18)

### Fixes

- a-select: scroll into view on invalid
- a-select: fix scrollIntoView on invalid, even if already in view
- fix form fields validating on inputs

## 1.14.3 (2024-09-04)

### Fixes

- fix form fields validating on inputs

## 1.14.2 (2024-08-23)

### Fixes

- a-select: fix scrollIntoView on invalid, even if already in view

## 1.14.1 (2024-08-21)

### Fixes

- a-select: scroll into view on invalid

## 1.14.0 (2024-08-15)

### Features

- add form reset event handling for select and checkbox in a-form-field

## 1.13.0 (2024-08-13)

### Features

- a-chart: added line chart type

## 1.12.0 (2024-08-03)

### Features

- renamed `input` slot to `trigger` for a-popover and a-select

### Fixes

- a-expandable: fix change event test

## 1.11.2 (2024-08-02)

### Fixes

- a-expandable: change event not dispatched on attribute change, and added test

## 1.11.1 (2024-08-02)

### Fixes

- improve testability of a-expandable
- added chart element tests
- added tests for blur element

## 1.11.0 (2024-08-01)

### Features

- a-select: handle blur and fix change events, add keyPressed for quicksearch
- a-select: added internal selected vaule, documentation and fixed event names
- a-select: arrow-down and up opens select when closed

## 1.10.1 (2024-07-29)

### Fixes

- a-select: initial value not set
- a-select: inital value not set

## 1.10.0 (2024-07-29)

### Features

- a-toast-feed: add nice stack animation

## 1.9.1 (2024-07-24)

### Fixes

- a-track: disable snap past maxIndex

## 1.9.0 (2024-07-24)

### Features

- a-track: fix track reaching beyound end

## 1.8.0 (2024-07-13)

### Features

- a-popover: real popover with top-level positioning

#### - Rewrote popover to propperly render on top of other content using floating-ui. 

- Add Event proxying to a-portal. 
- Fixed a-blur not focusing the correct elements and listen for Esc keydown on window instead of the element directly.

## 1.7.2 (2024-07-09)

### Fixes

- a-blur: to not set focus to children when using a mouse, to prevent safari outline

## 1.7.1 (2024-07-07)

### Fixes

- a-chart: layouting improvements
- a-chart: enabled tooltips

## 1.7.0 (2024-07-06)

### Features

- init a-chart element
- a-chart: css styling

## 1.6.1 (2024-07-05)

### Fixes

- a-scroll: add a histroy strategy to store scroll position per histroy state

## 1.6.0 (2024-07-03)

### Features

- merge a-adaptive into a-transition
- a-toggle: implement a-toggle

### Fixes

- a-select: initial options not updated

## 1.5.2 (2024-07-03)

### Fixes

- a-select: observe mutations for a-options

## 1.5.1 (2024-07-03)

### Fixes

- a-select: input fixed to required

## 1.5.0 (2024-07-02)

### Features

- added a-select for select and combobox components

## 1.4.1 (2024-06-28)

### Fixes

- fix cant scroll inside blur content

## 1.4.0 (2024-06-27)

### Features

- add a-transition element

## 1.3.0 (2024-06-27)

### Features

- advanced forms with selects and checkbox

### Fixes

- a-animation: fix default not loading

## 1.2.7 (2024-06-26)

### Fixes

- a-animation: fix recursion

## 1.2.6 (2024-06-26)

### Fixes

- a-animation: fix recursion bug

## 1.2.5 (2024-06-25)

### Fixes

- a-animation: manually cleanup instance cache

## 1.2.4 (2024-06-25)

### Fixes

- a-animation: fix out of memory error, do more cleanup

## 1.2.3 (2024-06-24)

### Fixes

- a-animation: cleanup wasm instance after use

## 1.2.2 (2024-06-23)

### Fixes

- a-animation: fix misc bugs from rewrite

## 1.2.1 (2024-06-23)

### Fixes

- a-animation: fix access after dispose

## 1.2.0 (2024-06-23)

### Features

- use rive advanced api to better handle loading of wasm

## 1.1.5 (2024-06-18)

### Fixes

- a-track: include item after lastIndex in maxIndex

## 1.1.4 (2024-06-18)

### Fixes

- a-track: fix wrong maxIndex
- a-track optimize snap algorithm, added more documentation

## 1.1.3 (2024-06-12)

### Fixes

- fix bug where current item was not calculated correctly
- a-track: calculate the item to snap to based on current velocity

## 1.1.2 (2024-06-10)

### Fixes

- Make toast elements restyleable

## 1.1.1 (2024-05-27)

### Fixes

- a-portal: fix the portal

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
