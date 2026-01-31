/**
 * @license
 * Copyright (c) 2024 Atrium Contributors
 * SPDX-License-Identifier: MIT
 */

import { ShortcutElement } from "./ShortcutElement.js";

declare global {
  interface HTMLElementTagNameMap {
    "a-shortcut": ShortcutElement;
  }
}

if (!customElements.get("a-shortcut")) {
  customElements.define("a-shortcut", ShortcutElement);
}

export { ShortcutElement } from "./ShortcutElement.js";
