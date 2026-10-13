/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import {
  VideoFullscreenElement,
  VideoMuteElement,
  VideoPlayElement,
  VideoSeekElement,
  VideoTimeElement,
  VideoVolumeElement,
} from "./Video.js";

const elements = {
  "a-video-play": VideoPlayElement,
  "a-video-mute": VideoMuteElement,
  "a-video-fullscreen": VideoFullscreenElement,
  "a-video-time": VideoTimeElement,
  "a-video-seek": VideoSeekElement,
  "a-video-volume": VideoVolumeElement,
};

for (const [name, element] of Object.entries(elements)) {
  try {
    customElements.define(name, element);
  } catch (err) {
    console.warn(`${name} already defined`);
  }
}

export {
  VideoFullscreenElement,
  VideoMuteElement,
  VideoPlayElement,
  VideoSeekElement,
  VideoTimeElement,
  VideoVolumeElement,
};
