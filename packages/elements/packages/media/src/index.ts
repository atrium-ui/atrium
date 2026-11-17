/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import {
  MediaElement,
  MediaMuteElement,
  MediaPlayElement,
  MediaRateElement,
  MediaSeekElement,
  MediaSkipElement,
  MediaTimeElement,
  MediaVolumeElement,
} from "./Media.js";

// a-media is defined first, so it is upgraded before its controls connect
const elements = {
  "a-media": MediaElement,
  "a-media-play": MediaPlayElement,
  "a-media-mute": MediaMuteElement,
  "a-media-skip": MediaSkipElement,
  "a-media-rate": MediaRateElement,
  "a-media-time": MediaTimeElement,
  "a-media-seek": MediaSeekElement,
  "a-media-volume": MediaVolumeElement,
};

for (const [name, element] of Object.entries(elements)) {
  try {
    customElements.define(name, element);
  } catch (err) {
    console.warn(`${name} already defined`);
  }
}

export {
  MediaElement,
  MediaMuteElement,
  MediaPlayElement,
  MediaRateElement,
  MediaSeekElement,
  MediaSkipElement,
  MediaTimeElement,
  MediaVolumeElement,
};
