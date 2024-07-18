/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { Track } from "./Track.js";

try {
	customElements.define("a-track", Track);
} catch (err) {
	console.warn("a-track already defined");
}

export * from "./Track";
